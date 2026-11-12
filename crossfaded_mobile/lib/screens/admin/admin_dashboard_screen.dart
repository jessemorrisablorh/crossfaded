import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/order.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../models/user_profile.dart';
import '../../services/firebase_service.dart';
import '../../services/sound_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/order_status_badge.dart';
import '../../widgets/app_image.dart';
import 'admin_product_form_screen.dart';
import 'admin_category_dialog.dart';
import 'admin_broadcast_dialog.dart';
import 'admin_profile_dialog.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  int _currentTab = 0; // 0: Orders, 1: Products, 2: Categories, 3: Users, 4: Broadcast & Account

  // Orders State
  String _orderFilter = 'all';

  // Products State
  String _productSearch = '';

  // Users State
  String _userSearch = '';

  @override
  void initState() {
    super.initState();
    SoundService.stopAlarm();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.shield_outlined, size: 16, color: AppTheme.primaryAmber),
                const SizedBox(width: 6),
                Text(
                  _appBarTitle,
                  style: GoogleFonts.anton(
                    fontSize: 20,
                    color: AppTheme.primaryAmber,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
            Text(
              _appBarSubtitle,
              style: GoogleFonts.poppins(
                fontSize: 10,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
        actions: [
          // Quick Alarm Test Icon
          IconButton(
            tooltip: 'Test Ring Alarm',
            icon: const Icon(Icons.ring_volume, color: AppTheme.primaryAmber, size: 20),
            onPressed: () {
              SoundService.startOrderAlarm();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF1E1E1E),
                  duration: const Duration(seconds: 4),
                  content: Row(
                    children: [
                      const Icon(Icons.volume_up, color: AppTheme.primaryAmber, size: 18),
                      const SizedBox(width: 8),
                      const Expanded(child: Text('Playing Admin Order Alarm...')),
                      TextButton(
                        onPressed: () => SoundService.stopAlarm(),
                        child: const Text('STOP', style: TextStyle(color: AppTheme.primaryAmber)),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(
        index: _currentTab,
        children: [
          _buildOrdersTab(),
          _buildProductsTab(),
          _buildCategoriesTab(),
          _buildUsersTab(),
          _buildBroadcastTab(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0A0A0A),
          border: Border(top: BorderSide(color: AppTheme.border, width: 0.8)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentTab,
          onTap: (idx) => setState(() => _currentTab = idx),
          selectedLabelStyle: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500),
          unselectedLabelStyle: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500),
          selectedItemColor: AppTheme.primaryAmber,
          unselectedItemColor: AppTheme.textMuted,
          backgroundColor: const Color(0xFF0A0A0A),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_outlined),
              activeIcon: Icon(Icons.shopping_bag, color: AppTheme.primaryAmber),
              label: 'Orders',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.inventory_2_outlined),
              activeIcon: Icon(Icons.inventory_2, color: AppTheme.primaryAmber),
              label: 'Products',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.category_outlined),
              activeIcon: Icon(Icons.category, color: AppTheme.primaryAmber),
              label: 'Categories',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_outline),
              activeIcon: Icon(Icons.people, color: AppTheme.primaryAmber),
              label: 'Users',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.campaign_outlined),
              activeIcon: Icon(Icons.campaign, color: AppTheme.primaryAmber),
              label: 'Broadcast',
            ),
          ],
        ),
      ),
    );
  }

  String get _appBarTitle {
    switch (_currentTab) {
      case 0:
        return 'ORDER FULFILLMENT';
      case 1:
        return 'PRODUCT CATALOG';
      case 2:
        return 'CATEGORY COLLECTIONS';
      case 3:
        return 'USERS & CLIENTS';
      case 4:
        return 'BROADCAST & PROFILE';
      default:
        return 'ADMIN PORTAL';
    }
  }

  String get _appBarSubtitle {
    switch (_currentTab) {
      case 0:
        return 'Real-time orders & alarm ringing';
      case 1:
        return 'Manage products, stock & pricing';
      case 2:
        return 'Curated collections & taxonomy';
      case 3:
        return 'Customer directory & account blocking';
      case 4:
        return 'Push notifications & admin security';
      default:
        return 'Control Center';
    }
  }

  // ==========================================================================
  // TAB 0: ORDERS MANAGEMENT
  // ==========================================================================
  Widget _buildOrdersTab() {
    return StreamBuilder<List<OrderModel>>(
      stream: _firebaseService.streamAllOrders(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryAmber));
        }

        final allOrders = snapshot.data ?? [];
        final filteredOrders = _filterOrders(allOrders);

        return Column(
          children: [
            _buildStatsRow(allOrders),
            _buildOrderFilterChips(allOrders),
            const SizedBox(height: 8),
            Expanded(
              child: filteredOrders.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.inbox_outlined, size: 48, color: AppTheme.textMuted),
                          const SizedBox(height: 12),
                          Text(
                            'No ${_orderFilter == 'all' ? '' : _orderFilter} orders found.',
                            style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      itemCount: filteredOrders.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (ctx, i) => _buildOrderAdminCard(filteredOrders[i]),
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatsRow(List<OrderModel> orders) {
    final pendingCount = orders.where((o) => o.status.toLowerCase() == 'pending').length;
    final deliveredCount = orders.where((o) => o.status.toLowerCase() == 'delivered').length;
    final totalRevenue = orders.fold<double>(0.0, (sum, o) => sum + o.total);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _statItem('TOTAL', '${orders.length}', Colors.white),
          Container(width: 1, height: 32, color: AppTheme.border),
          _statItem('PENDING', '$pendingCount', AppTheme.primaryAmber, isHighlight: pendingCount > 0),
          Container(width: 1, height: 32, color: AppTheme.border),
          _statItem('DELIVERED', '$deliveredCount', AppTheme.emerald),
          Container(width: 1, height: 32, color: AppTheme.border),
          _statItem('REVENUE', 'GH₵ ${totalRevenue.toStringAsFixed(0)}', AppTheme.primaryAmber),
        ],
      ),
    );
  }

  Widget _statItem(String label, String value, Color color, {bool isHighlight = false}) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.raleway(fontSize: 15, fontWeight: FontWeight.w800, color: color),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: isHighlight ? AppTheme.primaryAmber : AppTheme.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildOrderFilterChips(List<OrderModel> orders) {
    final filters = [
      {'key': 'all', 'label': 'All (${orders.length})'},
      {'key': 'pending', 'label': 'Pending (${orders.where((o) => o.status == 'pending').length})'},
      {'key': 'confirmed', 'label': 'Confirmed (${orders.where((o) => o.status == 'confirmed').length})'},
      {'key': 'out_for_delivery', 'label': 'Out for Delivery (${orders.where((o) => o.status == 'out_for_delivery').length})'},
      {'key': 'delivered', 'label': 'Delivered (${orders.where((o) => o.status == 'delivered').length})'},
      {'key': 'cancelled', 'label': 'Cancelled (${orders.where((o) => o.status == 'cancelled').length})'},
    ];

    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (ctx, i) {
          final f = filters[i];
          final isSelected = _orderFilter == f['key'];
          return ChoiceChip(
            label: Text(f['label']!),
            selected: isSelected,
            onSelected: (_) => setState(() => _orderFilter = f['key']!),
            backgroundColor: AppTheme.card,
            selectedColor: AppTheme.primaryAmber,
            labelStyle: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              color: isSelected ? Colors.black : Colors.white,
            ),
            side: BorderSide(color: isSelected ? AppTheme.primaryAmber : AppTheme.border),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          );
        },
      ),
    );
  }

  List<OrderModel> _filterOrders(List<OrderModel> orders) {
    if (_orderFilter == 'all') return orders;
    return orders.where((o) => o.status.toLowerCase() == _orderFilter.toLowerCase()).toList();
  }

  Widget _buildOrderAdminCard(OrderModel order) {
    final dateFormat = DateFormat('MMM d, h:mm a');
    final formattedDate =
        order.dateCreated != null ? dateFormat.format(order.dateCreated!) : 'Recently';

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: order.status == 'pending' ? AppTheme.primaryAmber.withOpacity(0.5) : AppTheme.border,
          width: order.status == 'pending' ? 1.5 : 1,
        ),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    order.orderNumber,
                    style: GoogleFonts.raleway(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(width: 8),
                  Text(formattedDate, style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted)),
                ],
              ),
              OrderStatusBadge(status: order.status),
            ],
          ),
          const Divider(color: AppTheme.border, height: 18),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 16, color: AppTheme.primaryAmber),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.customerName,
                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(order.phone, style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.phone, color: AppTheme.emerald, size: 18),
                tooltip: 'Call Customer',
                onPressed: () => _launchPhone(order.phone),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 16, color: AppTheme.primaryAmber),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  order.distanceKm != null
                      ? '${order.address} (${order.distanceKm!.toStringAsFixed(1)} km)'
                      : order.address,
                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              children: [
                ...order.cartItems.map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${item.quantity}× ${item.productName}',
                              style: GoogleFonts.poppins(fontSize: 11, color: Colors.white),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            'GH₵ ${(item.price * item.quantity).toStringAsFixed(2)}',
                            style: GoogleFonts.raleway(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    )),
                const Divider(color: AppTheme.border, height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Delivery Fee (${order.paymentMethod}):',
                        style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted)),
                    Text('GH₵ ${order.deliveryFee.toStringAsFixed(2)}',
                        style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted)),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('TOTAL PAYABLE:',
                        style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text(
                      'GH₵ ${order.total.toStringAsFixed(2)}',
                      style: GoogleFonts.raleway(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.primaryAmber),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'UPDATE STATUS:',
            style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (order.status != 'confirmed')
                _orderActionButton('Confirm ✓', Colors.blueAccent, () => _updateOrderStatus(order.id, 'confirmed')),
              if (order.status != 'out_for_delivery')
                _orderActionButton('Out for Delivery 🛵', Colors.orangeAccent, () => _updateOrderStatus(order.id, 'out_for_delivery')),
              if (order.status != 'delivered')
                _orderActionButton('Delivered 🎉', AppTheme.emerald, () => _updateOrderStatus(order.id, 'delivered')),
              if (order.status != 'cancelled')
                _orderActionButton('Cancel ✕', AppTheme.errorRed, () => _updateOrderStatus(order.id, 'cancelled')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _orderActionButton(String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.5)),
        ),
        child: Text(label, style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
      ),
    );
  }

  Future<void> _updateOrderStatus(String orderId, String newStatus) async {
    try {
      await _firebaseService.updateOrderStatus(orderId, newStatus);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF1E1E1E),
          content: Text('Order status updated to ${newStatus.toUpperCase()}', style: const TextStyle(color: Colors.white)),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppTheme.errorRed, content: Text('Error: $e')),
      );
    }
  }

  Future<void> _launchPhone(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  // ==========================================================================
  // TAB 1: PRODUCTS MANAGEMENT (CREATE, EDIT, DELETE)
  // ==========================================================================
  Widget _buildProductsTab() {
    return StreamBuilder<List<Product>>(
      stream: _firebaseService.streamProducts(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryAmber));
        }

        final allProds = snapshot.data ?? [];
        final filtered = _productSearch.trim().isEmpty
            ? allProds
            : allProds.where((p) {
                final q = _productSearch.toLowerCase();
                return p.name.toLowerCase().contains(q) ||
                    p.categoryName.toLowerCase().contains(q);
              }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                      onChanged: (val) => setState(() => _productSearch = val),
                      decoration: InputDecoration(
                        hintText: 'Search products by title or category...',
                        prefixIcon: const Icon(Icons.search, color: AppTheme.primaryAmber, size: 18),
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        filled: true,
                        fillColor: AppTheme.card,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AdminProductFormScreen()),
                      );
                    },
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text('ADD'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryAmber,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: Text(
                        'No products found.',
                        style: GoogleFonts.poppins(color: AppTheme.textMuted),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (ctx, i) {
                        final p = filtered[i];
                        return Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.card,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  color: Colors.black,
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: AppImage(
                                  imageUrl: p.image,
                                  fit: BoxFit.cover,
                                  fallbackAsset: 'assets/images/crushers.jpeg',
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      p.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.poppins(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        Text(
                                          'GH₵ ${p.price.toStringAsFixed(2)}',
                                          style: GoogleFonts.raleway(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.primaryAmber,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: p.stock > 0
                                                ? AppTheme.emerald.withOpacity(0.15)
                                                : AppTheme.errorRed.withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            p.stock > 0 ? '${p.stock} in stock' : 'Out of stock',
                                            style: GoogleFonts.poppins(
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: p.stock > 0 ? AppTheme.emerald : AppTheme.errorRed,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    Text(
                                      p.categoryName,
                                      style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                              // Edit Button
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, color: AppTheme.primaryAmber, size: 20),
                                tooltip: 'Edit Product',
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => AdminProductFormScreen(productToEdit: p),
                                    ),
                                  );
                                },
                              ),
                              // Delete Button
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppTheme.errorRed, size: 20),
                                tooltip: 'Delete Product',
                                onPressed: () => _confirmDeleteProduct(p),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  void _confirmDeleteProduct(Product p) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161616),
        title: Text('Delete Product', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to permanently delete "${p.name}"?',
          style: GoogleFonts.poppins(color: AppTheme.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('CANCEL', style: TextStyle(color: Colors.white)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            onPressed: () async {
              Navigator.pop(ctx);
              await _firebaseService.deleteProduct(p.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Product deleted successfully.')),
                );
              }
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ==========================================================================
  // TAB 2: CATEGORIES MANAGEMENT (ADD, EDIT, DELETE)
  // ==========================================================================
  Widget _buildCategoriesTab() {
    return StreamBuilder<List<Category>>(
      stream: _firebaseService.streamCategories(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryAmber));
        }

        final categories = snapshot.data ?? [];

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'All Collections (${categories.length})',
                    style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => AdminCategoryDialog.show(context),
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text('ADD CATEGORY'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryAmber,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: categories.isEmpty
                  ? Center(
                      child: Text('No categories found.', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      itemCount: categories.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (ctx, i) {
                        final c = categories[i];
                        return Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.card,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  color: Colors.black,
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: AppImage(
                                  imageUrl: c.imageUrl,
                                  fit: BoxFit.cover,
                                  fallbackAsset: 'assets/images/crushers.jpeg',
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      c.name,
                                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                    Text(
                                      'Slug: ${c.slug}',
                                      style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted),
                                    ),
                                    if (c.description.isNotEmpty)
                                      Text(
                                        c.description,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                                      ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.edit_outlined, color: AppTheme.primaryAmber, size: 20),
                                onPressed: () => AdminCategoryDialog.show(context, c),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppTheme.errorRed, size: 20),
                                onPressed: () => _confirmDeleteCategory(c),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  void _confirmDeleteCategory(Category c) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161616),
        title: Text('Delete Category', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Delete "${c.name}"? Existing products in this category will not be deleted.',
          style: GoogleFonts.poppins(color: AppTheme.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL', style: TextStyle(color: Colors.white))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            onPressed: () async {
              Navigator.pop(ctx);
              await _firebaseService.deleteCategory(c.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Category deleted.')));
              }
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // ==========================================================================
  // TAB 3: USERS MANAGEMENT & BLOCK USER
  // ==========================================================================
  Widget _buildUsersTab() {
    return StreamBuilder<List<UserProfile>>(
      stream: _firebaseService.streamAllUsers(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryAmber));
        }

        final allUsers = snapshot.data ?? [];
        final filtered = _userSearch.trim().isEmpty
            ? allUsers
            : allUsers.where((u) {
                final q = _userSearch.toLowerCase();
                return u.displayName.toLowerCase().contains(q) ||
                    u.email.toLowerCase().contains(q) ||
                    u.phone.toLowerCase().contains(q);
              }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: TextField(
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                onChanged: (val) => setState(() => _userSearch = val),
                decoration: InputDecoration(
                  hintText: 'Search users by name, email, or phone...',
                  prefixIcon: const Icon(Icons.search, color: AppTheme.primaryAmber, size: 18),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  filled: true,
                  fillColor: AppTheme.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? Center(child: Text('No users found.', style: GoogleFonts.poppins(color: AppTheme.textMuted)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (ctx, i) {
                        final u = filtered[i];
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.card,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: u.isBlocked ? AppTheme.errorRed.withOpacity(0.5) : AppTheme.border,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: u.isBlocked
                                              ? AppTheme.errorRed.withOpacity(0.2)
                                              : AppTheme.primaryAmber.withOpacity(0.15),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: Text(
                                            u.displayName.isNotEmpty ? u.displayName[0].toUpperCase() : 'U',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: u.isBlocked ? AppTheme.errorRed : AppTheme.primaryAmber,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            u.displayName,
                                            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                                          ),
                                          Text(u.email, style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted)),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: u.isBlocked
                                          ? AppTheme.errorRed.withOpacity(0.15)
                                          : AppTheme.emerald.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      u.isBlocked ? 'BLOCKED' : (u.role == 'admin' ? 'ADMIN' : 'ACTIVE'),
                                      style: GoogleFonts.poppins(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: u.isBlocked ? AppTheme.errorRed : AppTheme.emerald,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (u.phone.isNotEmpty || u.address.isNotEmpty) ...[
                                const Divider(color: AppTheme.border, height: 16),
                                if (u.phone.isNotEmpty)
                                  Row(
                                    children: [
                                      const Icon(Icons.phone_outlined, size: 14, color: AppTheme.primaryAmber),
                                      const SizedBox(width: 6),
                                      Text(u.phone, style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
                                    ],
                                  ),
                                if (u.address.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.primaryAmber),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            u.address,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                              const SizedBox(height: 10),
                              // BLOCK / UNBLOCK TOGGLE
                              Align(
                                alignment: Alignment.centerRight,
                                child: OutlinedButton(
                                  onPressed: () => _toggleBlockUser(u),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: u.isBlocked ? AppTheme.emerald : AppTheme.errorRed,
                                    side: BorderSide(color: u.isBlocked ? AppTheme.emerald : AppTheme.errorRed),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    minimumSize: const Size(0, 32),
                                  ),
                                  child: Text(
                                    u.isBlocked ? 'UNBLOCK USER ✓' : 'BLOCK USER ✕',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _toggleBlockUser(UserProfile u) async {
    final newBlockedState = !u.isBlocked;
    try {
      await _firebaseService.toggleBlockUser(u.uid, newBlockedState);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: newBlockedState ? AppTheme.errorRed : AppTheme.emeraldBg,
          content: Text(
            newBlockedState ? '${u.displayName} has been blocked.' : '${u.displayName} has been unblocked.',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppTheme.errorRed, content: Text('Error: $e')),
      );
    }
  }

  // ==========================================================================
  // TAB 4: BROADCAST & ADMIN ACCOUNT SETTINGS
  // ==========================================================================
  Widget _buildBroadcastTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Push Notification Action Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.primaryAmber, width: 1.5),
              boxShadow: [
                BoxShadow(color: AppTheme.primaryAmber.withOpacity(0.12), blurRadius: 20),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryAmber.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.campaign, color: AppTheme.primaryAmber, size: 26),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PUSH BROADCAST',
                            style: GoogleFonts.anton(fontSize: 18, color: AppTheme.primaryAmber, letterSpacing: 1.2),
                          ),
                          Text(
                            'Send real-time alerts & announcements to all customers',
                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => AdminBroadcastDialog.show(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryAmber,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'COMPOSE PUSH NOTIFICATION',
                      style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Admin Profile & Password Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.manage_accounts_outlined, color: Colors.white, size: 26),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ADMIN ACCOUNT & SECURITY',
                            style: GoogleFonts.anton(fontSize: 18, color: Colors.white, letterSpacing: 1.2),
                          ),
                          Text(
                            'Update administrator name, credentials & password',
                            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => AdminProfileDialog.show(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: AppTheme.border, width: 1.2),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'CHANGE NAME & PASSWORD',
                      style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Past Broadcasts Log
          Text(
            'BROADCAST HISTORY',
            style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppTheme.primaryAmber),
          ),
          const SizedBox(height: 8),
          StreamBuilder<List<Map<String, dynamic>>>(
            stream: _firebaseService.streamBroadcastNotifications(),
            builder: (ctx, snap) {
              final notifs = snap.data ?? [];
              if (notifs.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.card,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Center(
                    child: Text('No broadcast messages sent yet.', style: GoogleFonts.poppins(color: AppTheme.textMuted, fontSize: 12)),
                  ),
                );
              }

              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: notifs.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (c, idx) {
                  final n = notifs[idx];
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                n['title']?.toString() ?? '',
                                style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                            Text(
                              'Target: ${n['target'] ?? 'all'}',
                              style: GoogleFonts.poppins(fontSize: 9, color: AppTheme.primaryAmber),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          n['message']?.toString() ?? '',
                          style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
