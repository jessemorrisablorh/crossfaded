import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/product_provider.dart';
import '../providers/cart_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/product_card.dart';
import 'cart_screen.dart';

class ShopScreen extends StatefulWidget {
  final String? initialCategory;

  const ShopScreen({Key? key, this.initialCategory}) : super(key: key);

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<ProductProvider>().setSelectedCategory(widget.initialCategory!);
      });
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final cartCount = context.watch<CartProvider>().totalCount;
    final products = productProvider.filteredProducts;
    final categories = productProvider.categories;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'CATALOG',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: cartCount > 0,
              backgroundColor: AppTheme.primaryAmber,
              textColor: Colors.black,
              label: Text(
                cartCount.toString(),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
              ),
              child: const Icon(Icons.shopping_bag_outlined, color: Colors.white),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CartScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // 1. Search Bar & Sort Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (val) => productProvider.setSearchQuery(val),
                    style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Search products, hardware...',
                      prefixIcon: const Icon(Icons.search, color: AppTheme.textMuted, size: 20),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16, color: AppTheme.textMuted),
                              onPressed: () {
                                _searchCtrl.clear();
                                productProvider.setSearchQuery('');
                              },
                            )
                          : null,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Sort Dropdown Button
                PopupMenuButton<String>(
                  icon: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: const Icon(Icons.tune, color: AppTheme.primaryAmber, size: 18),
                  ),
                  color: AppTheme.cardElevated,
                  onSelected: (sort) => productProvider.setSortBy(sort),
                  itemBuilder: (ctx) => [
                    PopupMenuItem(
                      value: 'featured',
                      child: Text('Featured First', style: GoogleFonts.poppins(fontSize: 12)),
                    ),
                    PopupMenuItem(
                      value: 'price-low',
                      child: Text('Price: Low to High', style: GoogleFonts.poppins(fontSize: 12)),
                    ),
                    PopupMenuItem(
                      value: 'price-high',
                      child: Text('Price: High to Low', style: GoogleFonts.poppins(fontSize: 12)),
                    ),
                    PopupMenuItem(
                      value: 'rating',
                      child: Text('Top Customer Rated', style: GoogleFonts.poppins(fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Horizontal Category Filter Chips
          SizedBox(
            height: 38,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _categoryChip('All', productProvider),
                ...categories.map((c) => _categoryChip(c.name, productProvider)),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // 3. Products Grid or Empty / Loading State
          Expanded(
            child: productProvider.isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primaryAmber),
                  )
                : products.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.search_off, size: 48, color: AppTheme.textMuted),
                            const SizedBox(height: 12),
                            Text(
                              'No products match your criteria.',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: () {
                                _searchCtrl.clear();
                                productProvider.setSearchQuery('');
                                productProvider.setSelectedCategory('All');
                              },
                              child: Text(
                                'Clear Filters',
                                style: GoogleFonts.poppins(
                                  color: AppTheme.primaryAmber,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.65,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                        itemCount: products.length,
                        itemBuilder: (ctx, i) => ProductCard(product: products[i]),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _categoryChip(String title, ProductProvider provider) {
    final isSelected = provider.selectedCategory.toLowerCase() == title.toLowerCase();

    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(title),
        selected: isSelected,
        onSelected: (_) => provider.setSelectedCategory(title),
        backgroundColor: AppTheme.card,
        selectedColor: AppTheme.primaryAmber,
        labelStyle: GoogleFonts.poppins(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          color: isSelected ? Colors.black : Colors.white,
        ),
        side: BorderSide(
          color: isSelected ? AppTheme.primaryAmber : AppTheme.border,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      ),
    );
  }
}
