import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/order.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/order_status_badge.dart';

class TrackOrderScreen extends StatefulWidget {
  final String? initialOrderId;

  const TrackOrderScreen({Key? key, this.initialOrderId}) : super(key: key);

  @override
  State<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends State<TrackOrderScreen> {
  final TextEditingController _orderIdCtrl = TextEditingController();
  final FirebaseService _firebaseService = FirebaseService();
  String _searchedId = '';

  @override
  void initState() {
    super.initState();
    if (widget.initialOrderId != null && widget.initialOrderId!.isNotEmpty) {
      _orderIdCtrl.text = widget.initialOrderId!;
      _searchedId = widget.initialOrderId!;
    }
  }

  @override
  void dispose() {
    _orderIdCtrl.dispose();
    super.dispose();
  }

  void _search() {
    final text = _orderIdCtrl.text.trim();
    if (text.isNotEmpty) {
      setState(() => _searchedId = text);
      FocusScope.of(context).unfocus();
    }
  }

  void _openWhatsApp(String orderNum) async {
    final text = 'Hello CrossFaded GH, I would like an update on my order with Order ID $orderNum.';
    final uri = Uri.parse('https://wa.me/233543236328?text=${Uri.encodeComponent(text)}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'TRACK DISPATCH',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Input Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'LOOKUP BY ORDER ID',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _orderIdCtrl,
                          style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                          decoration: const InputDecoration(
                            hintText: 'e.g. CF-123456 or paste order ID',
                            prefixIcon: Icon(Icons.search, color: AppTheme.primaryAmber, size: 20),
                            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          ),
                          onSubmitted: (_) => _search(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _search,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryAmber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                        child: const Text('TRACK'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Live Order Result Stream
            if (_searchedId.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(30),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.local_shipping_outlined, size: 48, color: AppTheme.textMuted),
                    const SizedBox(height: 12),
                    Text(
                      'Enter your Order ID above to track delivery dispatch status in real-time.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              )
            else
              StreamBuilder<OrderModel?>(
                stream: _firebaseService.streamOrderById(_searchedId),
                builder: (ctx, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: CircularProgressIndicator(color: AppTheme.primaryAmber),
                      ),
                    );
                  }

                  final order = snapshot.data;
                  if (order == null) {
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppTheme.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.error_outline, size: 40, color: Colors.orangeAccent),
                          const SizedBox(height: 10),
                          Text(
                            'Order not found for "$_searchedId"',
                            style: GoogleFonts.raleway(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Please double check your Order ID and try again.',
                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    );
                  }

                  return _buildOrderDetails(order);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderDetails(OrderModel order) {
    int currentStep = 1;
    if (order.status == 'delivered') {
      currentStep = 4;
    } else if (order.status == 'shipped') {
      currentStep = 3;
    } else if (order.status == 'processing') {
      currentStep = 2;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Order Reference Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ORDER REFERENCE',
                    style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                  ),
                  Text(
                    order.orderNumber,
                    style: GoogleFonts.raleway(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.primaryAmber),
                  ),
                ],
              ),
              OrderStatusBadge(status: order.status),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Live 4-Step Dispatch Progression
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'DISPATCH PROGRESSION',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  color: AppTheme.primaryAmber,
                ),
              ),
              const SizedBox(height: 14),
              _stepRow('1', 'Order Placed', 'Recorded in database', currentStep >= 1),
              _stepRow('2', 'Packaging', 'Discreet humidor packing', currentStep >= 2),
              _stepRow('3', 'Rider on the Way', 'Courier calls on arrival', currentStep >= 3),
              _stepRow('4', 'Delivered', 'Cash or MoMo on doorstep', currentStep >= 4, isLast: true),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Delivery Destination Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: AppTheme.primaryAmber),
                  const SizedBox(width: 6),
                  Text(
                    'DESTINATION & CONTACT',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(order.customerName, style: GoogleFonts.raleway(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13)),
              const SizedBox(height: 2),
              Text('Phone: ${order.phone}', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
              Text('Address: ${order.address}, ${order.city}', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
              if (order.distanceKm != null)
                Text(
                  'Distance: ${order.distanceKm} km from Accra Flagship Store',
                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.primaryAmber, fontWeight: FontWeight.w600),
                ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // Items and Total
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ORDER ITEMS (${order.cartItems.length})',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  color: AppTheme.primaryAmber,
                ),
              ),
              const SizedBox(height: 8),
              ...order.cartItems.map(
                (item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          '${item.quantity}× ${item.productName}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.white),
                        ),
                      ),
                      Text(
                        'GH₵ ${(item.price * item.quantity).toStringAsFixed(2)}',
                        style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.primaryAmber),
                      ),
                    ],
                  ),
                ),
              ),
              const Divider(color: AppTheme.border, height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Delivery Fee', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                  Text(
                    order.deliveryFee == 0 ? 'FREE' : 'GH₵ ${order.deliveryFee.toStringAsFixed(2)}',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.white),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total Amount', style: GoogleFonts.raleway(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(
                    'GH₵ ${order.total.toStringAsFixed(2)}',
                    style: GoogleFonts.raleway(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.primaryAmber),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // WhatsApp Help Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _openWhatsApp(order.orderNumber),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF25D366),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.chat_bubble_outline, size: 18),
                const SizedBox(width: 8),
                Text(
                  'WHATSAPP COURIER DISPATCH',
                  style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _stepRow(String stepNum, String title, String subtitle, bool isCompleted, {bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: isCompleted ? AppTheme.primaryAmber : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isCompleted ? AppTheme.primaryAmber : AppTheme.border,
                  width: 2,
                ),
              ),
              child: Center(
                child: isCompleted
                    ? const Icon(Icons.check, size: 14, color: Colors.black)
                    : Text(
                        stepNum,
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textMuted,
                        ),
                      ),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: isCompleted ? AppTheme.primaryAmber.withOpacity(0.4) : AppTheme.border,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.raleway(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isCompleted ? Colors.white : AppTheme.textMuted,
                ),
              ),
              Text(
                subtitle,
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }
}

