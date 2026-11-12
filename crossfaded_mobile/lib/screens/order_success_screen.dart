import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/order.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_image.dart';
import 'track_order_screen.dart';
import 'main_nav_screen.dart';

class OrderSuccessScreen extends StatefulWidget {
  final String orderId;
  final String orderNumber;

  const OrderSuccessScreen({
    Key? key,
    required this.orderId,
    required this.orderNumber,
  }) : super(key: key);

  @override
  State<OrderSuccessScreen> createState() => _OrderSuccessScreenState();
}

class _OrderSuccessScreenState extends State<OrderSuccessScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  OrderModel? _order;
  bool _loadingOrder = true;

  final Map<String, int> _itemRatings = {};
  final Map<String, TextEditingController> _itemCommentControllers = {};
  final Set<String> _submittingItems = {};
  final Map<String, double> _ratedItems = {}; // productId -> new catalog rating

  bool _copied = false;

  @override
  void initState() {
    super.initState();
    _fetchOrder();
  }

  @override
  void dispose() {
    for (var c in _itemCommentControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _fetchOrder() async {
    final order = await _firebaseService.getOrderById(widget.orderId);
    if (mounted) {
      setState(() {
        _order = order;
        _loadingOrder = false;
        if (order != null) {
          for (var item in order.cartItems) {
            _itemRatings[item.productId] = 5;
            _itemCommentControllers[item.productId] = TextEditingController();
          }
        }
      });
    }
  }

  Future<void> _submitRating(OrderItem item) async {
    final rating = (_itemRatings[item.productId] ?? 5).toDouble();
    final comment = _itemCommentControllers[item.productId]?.text.trim() ?? '';
    final customerName = _order?.customerName ?? 'Verified Buyer';

    setState(() => _submittingItems.add(item.productId));
    HapticFeedback.mediumImpact();

    try {
      final res = await _firebaseService.submitProductReview(
        productId: item.productId,
        rating: rating,
        comment: comment,
        userName: customerName,
        orderId: widget.orderId,
      );

      final newAvg = (res['newRating'] as num).toDouble();

      if (mounted) {
        setState(() {
          _submittingItems.remove(item.productId);
          _ratedItems[item.productId] = newAvg;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.emerald,
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Thank you! You rated "${item.productName}" ${rating.toInt()} ★ (Store score: $newAvg ★)',
                    style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submittingItems.remove(item.productId));
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.danger,
            content: Text('Error submitting rating: $e'),
          ),
        );
      }
    }
  }

  void _copyOrderId() {
    Clipboard.setData(ClipboardData(text: widget.orderNumber));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  void _openWhatsApp() async {
    final text = 'Hello CrossFaded GH, I have just placed an order with Order ID ${widget.orderNumber}. Please confirm my order for priority dispatch!';
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
        automaticallyImplyLeading: false,
        title: Text(
          'ORDER CONFIRMED',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const MainNavScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 10),

            // Success Icon
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.emerald.withOpacity(0.15),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.emerald, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.emerald.withOpacity(0.2),
                    blurRadius: 20,
                  ),
                ],
              ),
              child: const Icon(Icons.check, size: 44, color: AppTheme.emerald),
            ),
            const SizedBox(height: 16),

            // Headline
            Text(
              'ORDER PLACED SUCCESSFULLY!',
              textAlign: TextAlign.center,
              style: GoogleFonts.anton(
                fontSize: 24,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'A rider will be on the way soon. Pay with Cash or MoMo upon delivery.',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),

            const SizedBox(height: 24),

            // Prominent Order ID Box with Click-to-Copy
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primaryAmber, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryAmber.withOpacity(0.1),
                    blurRadius: 15,
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    'ORDER ID FOR TRACKING',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        widget.orderNumber,
                        style: GoogleFonts.raleway(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryAmber,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton(
                        onPressed: _copyOrderId,
                        icon: Icon(
                          _copied ? Icons.check : Icons.copy,
                          size: 18,
                          color: _copied ? AppTheme.emerald : AppTheme.textSecondary,
                        ),
                        tooltip: 'Copy Order ID',
                      ),
                    ],
                  ),
                  Text(
                    _copied ? 'Copied to clipboard!' : 'Tap the copy icon to copy your Order ID.',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: _copied ? AppTheme.emerald : AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Primary Track Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => TrackOrderScreen(initialOrderId: widget.orderNumber),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryAmber,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.local_shipping, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'TRACK ORDER LIVE',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            // WhatsApp Priority Confirmation Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _openWhatsApp,
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
                      'CONFIRM ON WHATSAPP',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Rate Purchased Products Card
            _buildRatingSection(),

            const SizedBox(height: 12),

            // 4-Step Dispatch Progression
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
                    'DISPATCH PROGRESSION',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _timelineStep('Step 1', 'Order Placed', 'Recorded in system', true),
                  _timelineStep('Step 2', 'Packaging', 'Discrete wrapping in humidor envelope', false),
                  _timelineStep('Step 3', 'Rider on the Way', 'Courier calls on arrival', false),
                  _timelineStep('Step 4', 'Delivered', 'Cash or MoMo on doorstep', false, isLast: true),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Back to Home
            TextButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const MainNavScreen()),
                  (route) => false,
                );
              },
              child: Text(
                'CONTINUE SHOPPING',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _timelineStep(String step, String title, String desc, bool isActive, {bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 18,
              height: 18,
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primaryAmber : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isActive ? AppTheme.primaryAmber : AppTheme.border,
                  width: 2,
                ),
              ),
              child: isActive
                  ? const Icon(Icons.check, size: 12, color: Colors.black)
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: AppTheme.border,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$step: $title',
                style: GoogleFonts.raleway(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isActive ? Colors.white : AppTheme.textMuted,
                ),
              ),
              Text(
                desc,
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRatingSection() {
    if (_loadingOrder) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(
          child: CircularProgressIndicator(color: AppTheme.primaryAmber),
        ),
      );
    }

    final items = _order?.cartItems ?? [];
    if (items.isEmpty) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161616),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primaryAmber.withOpacity(0.5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryAmber.withOpacity(0.08),
            blurRadius: 16,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.star, color: AppTheme.primaryAmber, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'RATE YOUR PURCHASED PRODUCTS',
                  style: GoogleFonts.anton(
                    fontSize: 14,
                    color: Colors.white,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.primaryAmber.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppTheme.primaryAmber.withOpacity(0.4)),
                ),
                child: Text(
                  'VERIFIED',
                  style: GoogleFonts.poppins(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryAmber,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Your review directly updates the product rating in our catalog across web and mobile.',
            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 16),

          // Items list
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (_, __) => const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Divider(color: AppTheme.border),
            ),
            itemBuilder: (ctx, idx) {
              final item = items[idx];
              final currentRating = _itemRatings[item.productId] ?? 5;
              final isSubmitting = _submittingItems.contains(item.productId);
              final ratedScore = _ratedItems[item.productId];

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: AppTheme.card,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.border),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: AppImage(
                          imageUrl: item.productImage ?? '',
                          fallbackAsset: 'assets/images/crushers.jpeg',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.productName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.raleway(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Qty: ${item.quantity} · GH₵ ${item.price.toStringAsFixed(2)}',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  if (ratedScore != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.emerald.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.emerald.withOpacity(0.4)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle, color: AppTheme.emerald, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'You rated this $currentRating ★. Store catalog score: $ratedScore ★',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.emerald,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else ...[
                    // Star rating bar
                    Row(
                      children: List.generate(5, (starIdx) {
                        final star = starIdx + 1;
                        final isFilled = star <= currentRating;
                        return IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                          icon: Icon(
                            isFilled ? Icons.star : Icons.star_border,
                            color: isFilled ? AppTheme.primaryAmber : AppTheme.textMuted,
                            size: 24,
                          ),
                          onPressed: () {
                            setState(() {
                              _itemRatings[item.productId] = star;
                            });
                          },
                        );
                      })..add(
                        Padding(
                          padding: const EdgeInsets.only(left: 6),
                          child: Text(
                            '$currentRating / 5',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryAmber,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Review input & Submit button
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _itemCommentControllers[item.productId],
                            style: GoogleFonts.poppins(fontSize: 12, color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Share a quick review (optional)...',
                              hintStyle: GoogleFonts.poppins(
                                fontSize: 11,
                                color: AppTheme.textMuted,
                              ),
                              filled: true,
                              fillColor: Colors.black,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 8,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: AppTheme.border),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: AppTheme.primaryAmber),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: isSubmitting ? null : () => _submitRating(item),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryAmber,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: isSubmitting
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.black,
                                  ),
                                )
                              : Text(
                                  'Rate',
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

