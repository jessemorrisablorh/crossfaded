import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/order.dart';
import '../providers/auth_provider.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/order_status_badge.dart';
import 'track_order_screen.dart';

class OrdersHistoryScreen extends StatelessWidget {
  const OrdersHistoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final uid = auth.user?.uid ?? '';
    final firebaseService = FirebaseService();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'ORDER HISTORY',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: uid.isEmpty || !auth.isAuthenticated
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock_outline, size: 48, color: AppTheme.primaryAmber),
                    const SizedBox(height: 14),
                    Text(
                      'Sign In to View Orders',
                      style: GoogleFonts.raleway(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Sign in to your account to review all your current and past dispatch deliveries.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              ),
            )
          : StreamBuilder<List<OrderModel>>(
              stream: firebaseService.streamUserOrders(uid),
              builder: (ctx, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppTheme.primaryAmber),
                  );
                }

                final orders = snapshot.data ?? [];
                if (orders.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.inbox_outlined, size: 48, color: AppTheme.textMuted),
                        const SizedBox(height: 12),
                        Text(
                          'No orders placed yet',
                          style: GoogleFonts.raleway(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Your order history will appear here once you make a purchase.',
                          style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(14),
                  itemCount: orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (ctx, i) {
                    final ord = orders[i];
                    final dateStr = ord.dateCreated != null
                        ? DateFormat('d MMM yyyy, h:mm a').format(ord.dateCreated!)
                        : 'Recent';

                    return InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => TrackOrderScreen(initialOrderId: ord.orderNumber),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
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
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  ord.orderNumber,
                                  style: GoogleFonts.raleway(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.primaryAmber,
                                  ),
                                ),
                                OrderStatusBadge(status: ord.status),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              dateStr,
                              style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
                            ),
                            const SizedBox(height: 10),
                            const Divider(color: AppTheme.border, height: 1),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${ord.cartItems.length} item${ord.cartItems.length > 1 ? 's' : ''}',
                                  style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary),
                                ),
                                Text(
                                  'GH₵ ${ord.total.toStringAsFixed(2)}',
                                  style: GoogleFonts.raleway(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}

