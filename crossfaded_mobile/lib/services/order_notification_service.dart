import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/order.dart';
import '../theme/app_theme.dart';
import '../screens/track_order_screen.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import 'firebase_service.dart';
import 'sound_service.dart';

class OrderNotificationService extends ChangeNotifier {
  static final OrderNotificationService _instance = OrderNotificationService._internal();
  factory OrderNotificationService() => _instance;
  OrderNotificationService._internal();

  final FirebaseService _firebaseService = FirebaseService();

  GlobalKey<NavigatorState>? _navigatorKey;

  // Admin Tracking
  StreamSubscription? _adminOrdersSub;
  final Set<String> _knownOrderIds = {};
  bool _isFirstAdminSnapshot = true;
  bool _isAdminActive = false;

  // Buyer Tracking
  StreamSubscription? _buyerOrdersSub;
  final Set<String> _buyerOrderIds = {};
  final Map<String, String> _lastKnownBuyerStatuses = {};
  bool _isFirstBuyerSnapshot = true;

  // Broadcast Notifications Tracking
  StreamSubscription? _broadcastSub;
  final Set<String> _knownNotificationIds = {};
  bool _isFirstBroadcastSnapshot = true;

  bool get isAdminActive => _isAdminActive;
  bool get isRinging => SoundService.isRinging;

  void init(GlobalKey<NavigatorState> navigatorKey) {
    _navigatorKey = navigatorKey;
    _loadBuyerOrdersFromStorage();
    _listenToBroadcastNotifications();
  }

  // --------------------------------------------------------------------------
  // BUYER NOTIFICATIONS
  // --------------------------------------------------------------------------
  Future<void> _loadBuyerOrdersFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList('buyer_tracked_order_ids') ?? [];
      _buyerOrderIds.addAll(list);
      _listenToBuyerOrders();
    } catch (_) {}
  }

  Future<void> registerBuyerOrder(String orderId) async {
    if (orderId.trim().isEmpty) return;
    _buyerOrderIds.add(orderId.trim());

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('buyer_tracked_order_ids', _buyerOrderIds.toList());
    } catch (_) {}

    _listenToBuyerOrders();
  }

  void _listenToBuyerOrders() {
    if (_buyerOrderIds.isEmpty) return;

    _buyerOrdersSub?.cancel();
    _buyerOrdersSub = _firebaseService
        .streamOrdersByIds(_buyerOrderIds.toList())
        .listen((orders) {
      for (final order in orders) {
        final prevStatus = _lastKnownBuyerStatuses[order.id];

        if (prevStatus == null) {
          // First time seeing this order
          _lastKnownBuyerStatuses[order.id] = order.status;
        } else if (prevStatus.toLowerCase() != order.status.toLowerCase()) {
          // STATUS HAS CHANGED!
          _lastKnownBuyerStatuses[order.id] = order.status;

          if (!_isFirstBuyerSnapshot) {
            _triggerBuyerStatusNotification(order);
          }
        }
      }
      _isFirstBuyerSnapshot = false;
    });
  }

  void _triggerBuyerStatusNotification(OrderModel order) {
    // 1. Play pleasant notification chime
    SoundService.playNotificationChime();

    // 2. Show in-app banner overlay
    final context = _navigatorKey?.currentContext;
    if (context == null) return;

    final statusText = order.status.toUpperCase();
    String message = 'Your order is currently $statusText.';
    IconData icon = Icons.info_outline;
    Color iconColor = AppTheme.primaryAmber;

    if (order.status.toLowerCase() == 'confirmed') {
      message = 'Your order #${order.orderNumber} has been confirmed by CrossFaded lounge!';
      icon = Icons.check_circle_outline;
      iconColor = AppTheme.emerald;
    } else if (order.status.toLowerCase() == 'out_for_delivery') {
      message = 'A rider is on the way with your order #${order.orderNumber}! Please have cash/MoMo ready.';
      icon = Icons.two_wheeler_outlined;
      iconColor = Colors.orangeAccent;
    } else if (order.status.toLowerCase() == 'delivered') {
      message = 'Order #${order.orderNumber} has been delivered. Enjoy your session!';
      icon = Icons.done_all;
      iconColor = AppTheme.emerald;
    } else if (order.status.toLowerCase() == 'cancelled') {
      message = 'Order #${order.orderNumber} was cancelled.';
      icon = Icons.cancel_outlined;
      iconColor = AppTheme.errorRed;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 8),
        margin: const EdgeInsets.all(12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: AppTheme.primaryAmber, width: 1.2),
        ),
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ORDER STATUS UPDATE',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    message,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => TrackOrderScreen(initialOrderId: order.orderNumber),
                  ),
                );
              },
              child: Text(
                'TRACK',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryAmber,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --------------------------------------------------------------------------
  // ADMIN NOTIFICATIONS & LOUD RINGING
  // --------------------------------------------------------------------------
  void startAdminListening() {
    if (_isAdminActive) return;
    _isAdminActive = true;
    _isFirstAdminSnapshot = true;
    _knownOrderIds.clear();

    _adminOrdersSub?.cancel();
    _adminOrdersSub = _firebaseService.streamAllOrders().listen((orders) {
      if (_isFirstAdminSnapshot) {
        for (final o in orders) {
          _knownOrderIds.add(o.id);
        }
        _isFirstAdminSnapshot = false;
        return;
      }

      // Check for genuinely new orders
      for (final order in orders) {
        if (!_knownOrderIds.contains(order.id)) {
          _knownOrderIds.add(order.id);
          _triggerNewOrderAdminAlarm(order);
          break; // Ring for the latest
        }
      }
    });

    notifyListeners();
  }

  void stopAdminListening() {
    _isAdminActive = false;
    _adminOrdersSub?.cancel();
    SoundService.stopAlarm();
    notifyListeners();
  }

  void _triggerNewOrderAdminAlarm(OrderModel order) {
    // 1. START LOUD ALARM RINGING
    SoundService.startOrderAlarm();
    notifyListeners();

    // 2. SHOW URGENT FULL-SCREEN / MODAL DIALOG
    final context = _navigatorKey?.currentContext;
    if (context == null) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dlgContext) {
        return PopScope(
          canPop: false,
          child: Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.primaryAmber, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryAmber.withOpacity(0.3),
                    blurRadius: 30,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Flashing Alert Header
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryAmber.withOpacity(0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryAmber, width: 1.5),
                    ),
                    child: const Icon(
                      Icons.notifications_active,
                      color: AppTheme.primaryAmber,
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: 14),

                  Text(
                    'NEW ORDER RECEIVED!',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.anton(
                      fontSize: 24,
                      color: AppTheme.primaryAmber,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),

                  Text(
                    'Phone is ringing with customer order alert.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Order Details Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0A0A0A),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              order.orderNumber,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppTheme.emerald.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'GH₵ ${order.total.toStringAsFixed(2)}',
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.emerald,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: AppTheme.border, height: 16),
                        _detailRow(Icons.person_outline, order.customerName),
                        const SizedBox(height: 6),
                        _detailRow(Icons.phone_outlined, order.phone),
                        const SizedBox(height: 6),
                        _detailRow(Icons.location_on_outlined, order.address, maxLines: 2),
                        const SizedBox(height: 6),
                        _detailRow(
                          Icons.shopping_bag_outlined,
                          '${order.cartItems.length} items • Cash on Delivery',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Buttons
                  Row(
                    children: [
                      // Stop Ringing Button
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            SoundService.stopAlarm();
                            Navigator.of(dlgContext).pop();
                            notifyListeners();
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: AppTheme.border, width: 1.2),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            'DISMISS RING',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),

                      // View Order / Open Dashboard Button
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            SoundService.stopAlarm();
                            Navigator.of(dlgContext).pop();
                            notifyListeners();
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const AdminDashboardScreen(),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryAmber,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            'VIEW ORDER',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _detailRow(IconData icon, String text, {int maxLines = 1}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: AppTheme.primaryAmber),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            maxLines: maxLines,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.poppins(
              fontSize: 11,
              color: AppTheme.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  void _listenToBroadcastNotifications() {
    _broadcastSub?.cancel();
    _broadcastSub = _firebaseService.streamBroadcastNotifications().listen((notifs) {
      if (_isFirstBroadcastSnapshot) {
        for (final n in notifs) {
          if (n['id'] != null) _knownNotificationIds.add(n['id'].toString());
        }
        _isFirstBroadcastSnapshot = false;
        return;
      }

      for (final n in notifs) {
        final id = n['id']?.toString() ?? '';
        if (id.isNotEmpty && !_knownNotificationIds.contains(id)) {
          _knownNotificationIds.add(id);
          _triggerBroadcastNotification(
            n['title']?.toString() ?? 'Store Announcement',
            n['message']?.toString() ?? '',
          );
          break;
        }
      }
    });
  }

  void _triggerBroadcastNotification(String title, String message) {
    SoundService.playNotificationChime();
    final context = _navigatorKey?.currentContext;
    if (context == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF1E1E1E),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 10),
        margin: const EdgeInsets.all(12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: AppTheme.primaryAmber, width: 1.5),
        ),
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primaryAmber.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.campaign, color: AppTheme.primaryAmber, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    message,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _adminOrdersSub?.cancel();
    _buyerOrdersSub?.cancel();
    _broadcastSub?.cancel();
    SoundService.stopAlarm();
    super.dispose();
  }
}

