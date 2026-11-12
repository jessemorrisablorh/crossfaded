import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/order.dart';
import '../providers/cart_provider.dart';
import '../providers/delivery_provider.dart';
import '../providers/auth_provider.dart';
import '../services/firebase_service.dart';
import '../services/order_notification_service.dart';
import '../theme/app_theme.dart';
import '../widgets/address_search_field.dart';
import 'order_success_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({Key? key}) : super(key: key);

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController(text: 'Accra');
  final _regionCtrl = TextEditingController(text: 'Greater Accra');

  bool _isPlacingOrder = false;
  bool _saveDetails = true;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>();
    final delivery = context.read<DeliveryProvider>();

    if (auth.profile != null) {
      _nameCtrl.text = auth.profile!.displayName;
      _phoneCtrl.text = auth.profile!.phone;
      _emailCtrl.text = auth.profile!.email;
      if (auth.profile!.address.isNotEmpty) {
        _addressCtrl.text = auth.profile!.address;
        delivery.setDestination(
          address: auth.profile!.address,
          placename: auth.profile!.placename,
          lat: auth.profile!.lat,
          lng: auth.profile!.lng,
        );
      }
    } else if (auth.user != null) {
      _emailCtrl.text = auth.user!.email ?? '';
    }

    if (delivery.address.isNotEmpty && _addressCtrl.text.isEmpty) {
      _addressCtrl.text = delivery.address;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _regionCtrl.dispose();
    super.dispose();
  }

  void _handlePlaceOrder() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF1F1F1F),
          content: Text(
            'Please fill in all required delivery contact fields.',
            style: TextStyle(color: Colors.redAccent),
          ),
        ),
      );
      return;
    }

    final cart = context.read<CartProvider>();
    if (cart.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF1F1F1F),
          content: Text(
            'Your shopping bag is empty.',
            style: TextStyle(color: Colors.orangeAccent),
          ),
        ),
      );
      return;
    }

    final delivery = context.read<DeliveryProvider>();
    final auth = context.read<AuthProvider>();

    final subtotal = cart.subtotal;
    final deliveryFee = delivery.calculateFee(subtotal);
    final total = subtotal + deliveryFee;

    setState(() => _isPlacingOrder = true);

    try {
      // Generate clean CF-XXXXXX order number
      final randomSixDigit = (100000 + Random().nextInt(900000)).toString();
      final orderNumber = 'CF-$randomSixDigit';

      final orderItems = cart.items
          .map(
            (item) => OrderItem(
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              productImage: item.productImage,
            ),
          )
          .toList();

      final newOrder = OrderModel(
        id: '',
        orderNumber: orderNumber,
        uid: auth.user?.uid,
        customerName: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        phone: _phoneCtrl.text.trim(),
        address: _addressCtrl.text.trim(),
        placename: delivery.placename,
        city: _cityCtrl.text.trim(),
        region: _regionCtrl.text.trim(),
        lat: delivery.lat,
        lng: delivery.lng,
        distanceKm: delivery.distanceKm > 0 ? delivery.distanceKm : null,
        deliveryFee: deliveryFee,
        subtotal: subtotal,
        total: total,
        status: 'pending',
        paid: false,
        paymentMethod: 'cod',
        paymentMethodTitle: 'Payment on delivery (Cash or MoMo)',
        cartItems: orderItems,
      );

      final firebaseService = FirebaseService();
      final docId = await firebaseService.createOrder(newOrder);

      // Register with OrderNotificationService for real-time buyer notifications
      await OrderNotificationService().registerBuyerOrder(docId);

      // Save delivery details to user profile if requested
      if (_saveDetails && auth.isAuthenticated) {
        await auth.updateDeliveryDetails(
          address: _addressCtrl.text.trim(),
          placename: delivery.placename,
          lat: delivery.lat,
          lng: delivery.lng,
          phone: _phoneCtrl.text.trim(),
        );
      }

      // Clear the local cart
      cart.clearCart();

      setState(() => _isPlacingOrder = false);

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => OrderSuccessScreen(
              orderId: docId,
              orderNumber: orderNumber,
            ),
          ),
        );
      }
    } catch (e) {
      setState(() => _isPlacingOrder = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF1F1F1F),
            content: Text(
              'Error placing order: ${e.toString()}',
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final delivery = context.watch<DeliveryProvider>();
    final subtotal = cart.subtotal;
    final deliveryFee = delivery.calculateFee(subtotal);
    final total = subtotal + deliveryFee;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'CHECKOUT',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. RECIPIENT INFORMATION
              _sectionHeader('1. CONTACT INFORMATION'),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameCtrl,
                      style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Full Name *',
                        hintText: 'e.g. Kwame Mensah',
                        prefixIcon: Icon(Icons.person_outline, size: 20, color: AppTheme.textMuted),
                      ),
                      validator: (val) => val == null || val.trim().isEmpty ? 'Please enter recipient name' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _phoneCtrl,
                      keyboardType: TextInputType.phone,
                      style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Phone Number (Call on Arrival) *',
                        hintText: 'e.g. 054 323 6328',
                        prefixIcon: Icon(Icons.phone_outlined, size: 20, color: AppTheme.textMuted),
                      ),
                      validator: (val) => val == null || val.trim().length < 9 ? 'Please enter a valid phone number' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        hintText: 'e.g. kwame@example.com',
                        prefixIcon: Icon(Icons.mail_outline, size: 20, color: AppTheme.textMuted),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. DELIVERY DESTINATION (WITH GOOGLE PLACES)
              _sectionHeader('2. DELIVERY DESTINATION'),
              const SizedBox(height: 10),
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
                    AddressSearchField(
                      controller: _addressCtrl,
                      onChanged: (val) {
                        delivery.setDestination(address: val);
                      },
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _cityCtrl,
                            style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                            decoration: const InputDecoration(labelText: 'City *'),
                            validator: (v) => v == null || v.isEmpty ? 'City required' : null,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            controller: _regionCtrl,
                            style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                            decoration: const InputDecoration(labelText: 'Region *'),
                            validator: (v) => v == null || v.isEmpty ? 'Region required' : null,
                          ),
                        ),
                      ],
                    ),

                    if (delivery.distanceKm > 0) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.navigation, size: 13, color: AppTheme.primaryAmber),
                            const SizedBox(width: 6),
                            Text(
                              'Dispatch Distance: ${delivery.distanceKm} km from Store',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppTheme.primaryAmber,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Checkbox(
                          value: _saveDetails,
                          activeColor: AppTheme.primaryAmber,
                          checkColor: Colors.black,
                          onChanged: (v) => setState(() => _saveDetails = v ?? true),
                        ),
                        Expanded(
                          child: Text(
                            'Save delivery address for next time',
                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 3. PAYMENT METHOD (CASH ON DELIVERY)
              _sectionHeader('3. PAYMENT METHOD'),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.primaryAmber.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryAmber.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.payments, color: AppTheme.primaryAmber, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Cash / MoMo on Delivery',
                            style: GoogleFonts.raleway(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Inspect items upon doorstep arrival before paying rider.',
                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.check_circle, color: AppTheme.primaryAmber, size: 20),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 4. ORDER SUMMARY & SUBMIT
              _sectionHeader('4. ORDER SUMMARY'),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Items Subtotal (${cart.totalCount})', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                        Text('GH₵ ${subtotal.toStringAsFixed(2)}', style: GoogleFonts.poppins(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Delivery Fee', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary)),
                        deliveryFee == 0.0
                            ? Text(
                                'FREE (Over GH₵ 500)',
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.emerald,
                                ),
                              )
                            : Text(
                                'GH₵ ${deliveryFee.toStringAsFixed(2)}',
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: AppTheme.border),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'TOTAL PAYABLE',
                          style: GoogleFonts.raleway(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        Text(
                          'GH₵ ${total.toStringAsFixed(2)}',
                          style: GoogleFonts.raleway(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryAmber,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // CONFIRM ORDER BUTTON
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isPlacingOrder ? null : _handlePlaceOrder,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryAmber,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isPlacingOrder
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.check_circle_outline, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'CONFIRM ORDER • GH₵ ${total.toStringAsFixed(2)}',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.poppins(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.2,
        color: AppTheme.primaryAmber,
      ),
    );
  }
}

