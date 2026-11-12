import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../services/firebase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_image.dart';
import 'cart_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({Key? key, required this.product})
    : super(key: key);

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _selectedImageIndex = 0;
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final images = product.imageUrls.isNotEmpty
        ? product.imageUrls
        : [product.image];
    final cartCount = context.watch<CartProvider>().totalCount;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          product.categoryName.toUpperCase(),
          style: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            color: AppTheme.primaryAmber,
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
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
              child: const ImageIcon(
                AssetImage("images/cart.png"),
                color: Colors.white,
              ),
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
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Large Image Viewer
                  AspectRatio(
                    aspectRatio: 1.1,
                    child: Container(
                      color: const Color(0xFF0D0D0D),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          AppImage(
                            imageUrl: images[_selectedImageIndex],
                            fit: BoxFit.contain,
                            fallbackAsset: 'assets/images/cigar.png',
                          ),

                          // Stock badge
                          Positioned(
                            top: 14,
                            left: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.85),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppTheme.border),
                              ),
                              child: Text(
                                product.stock <= 5 && product.stock > 0
                                    ? 'ONLY ${product.stock} LEFT'
                                    : 'IN STOCK • ACCRA DISPATCH',
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: product.stock <= 5 && product.stock > 0
                                      ? Colors.orangeAccent
                                      : AppTheme.emerald,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Image Thumbnails Row (if multiple images)
                  if (images.length > 1)
                    Container(
                      height: 60,
                      margin: const EdgeInsets.symmetric(vertical: 10),
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        scrollDirection: Axis.horizontal,
                        itemCount: images.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (ctx, idx) {
                          final isSelected = idx == _selectedImageIndex;
                          return InkWell(
                            onTap: () =>
                                setState(() => _selectedImageIndex = idx),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              width: 60,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected
                                      ? AppTheme.primaryAmber
                                      : AppTheme.border,
                                  width: isSelected ? 2 : 1,
                                ),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: AppImage(
                                imageUrl: images[idx],
                                fit: BoxFit.cover,
                                fallbackAsset: 'assets/images/cigar.png',
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                  // 2. Product Title & Price Details
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: GoogleFonts.raleway(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Price Row
                        Row(
                          children: [
                            Text(
                              'GH₵ ${product.price.toStringAsFixed(2)}',
                              style: GoogleFonts.raleway(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primaryAmber,
                              ),
                            ),
                            if (product.salePrice != null) ...[
                              const SizedBox(width: 10),
                              Text(
                                'GH₵ ${product.salePrice!.toStringAsFixed(2)}',
                                style: GoogleFonts.raleway(
                                  fontSize: 14,
                                  color: AppTheme.textMuted,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                            ],
                            const Spacer(),
                            // Rating stars (Tap to rate)
                            InkWell(
                              onTap: () => _showRateDialog(context, product),
                              borderRadius: BorderRadius.circular(8),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.star,
                                      color: AppTheme.primaryAmber,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${product.rating} (${product.reviewsCount})',
                                      style: GoogleFonts.poppins(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(
                                      Icons.rate_review_outlined,
                                      color: AppTheme.primaryAmber,
                                      size: 14,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),
                        const Divider(color: AppTheme.border),
                        const SizedBox(height: 16),

                        // 3. Description
                        Text(
                          'PRODUCT DESCRIPTION',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                            color: AppTheme.primaryAmber,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.description.isNotEmpty
                              ? product.description
                              : 'Engineered for luxury sessions. Handcrafted with medical-grade materials and built for supreme performance in Ghana.',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: AppTheme.textSecondary,
                            height: 1.5,
                          ),
                        ),

                        const SizedBox(height: 20),

                        // 4. Specifications Card
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.card,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'AUTHENTICITY & CRAFTSMANSHIP',
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.0,
                                  color: AppTheme.primaryAmber,
                                ),
                              ),
                              const SizedBox(height: 8),
                              _specRow(
                                'Origin',
                                'Accra Official CrossFaded Stock',
                              ),
                              _specRow('Condition', 'Brand New in Sealed Box'),
                              _specRow('Settlement', 'Cash / MoMo on Delivery'),
                              _specRow(
                                'Dispatch',
                                'Same-Day Courier across Accra',
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 5. Sticky Bottom Action Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFF0F0F0F),
              border: Border(top: BorderSide(color: AppTheme.border)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Quantity Stepper
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(
                            Icons.remove,
                            size: 16,
                            color: Colors.white,
                          ),
                          onPressed: _quantity > 1
                              ? () => setState(() => _quantity--)
                              : null,
                        ),
                        Text(
                          _quantity.toString(),
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.add,
                            size: 16,
                            color: Colors.white,
                          ),
                          onPressed: () => setState(() => _quantity++),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Add to Bag Button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        context.read<CartProvider>().addToCart(
                          product,
                          quantity: _quantity,
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: const Color(0xFF1F1F1F),
                            behavior: SnackBarBehavior.floating,
                            content: Row(
                              children: [
                                const Icon(
                                  Icons.check_circle,
                                  color: AppTheme.primaryAmber,
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Added $_quantity× ${product.name} to bag',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            action: SnackBarAction(
                              label: 'VIEW BAG',
                              textColor: AppTheme.primaryAmber,
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const CartScreen(),
                                  ),
                                );
                              },
                            ),
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
                          const Icon(Icons.shopping_bag, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'ADD TO BAG • GH₵ ${(product.price * _quantity).toStringAsFixed(2)}',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _specRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  void _showRateDialog(BuildContext context, Product product) {
    int selectedRating = 5;
    final commentCtrl = TextEditingController();
    final nameCtrl = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E1E1E),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: Text(
            'RATE THIS PRODUCT',
            style: GoogleFonts.anton(
              color: AppTheme.primaryAmber,
              fontSize: 18,
              letterSpacing: 1.0,
            ),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: GoogleFonts.raleway(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    final star = index + 1;
                    return IconButton(
                      icon: Icon(
                        star <= selectedRating ? Icons.star : Icons.star_border,
                        color: AppTheme.primaryAmber,
                        size: 28,
                      ),
                      onPressed: () {
                        setDialogState(() => selectedRating = star);
                      },
                    );
                  }),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: nameCtrl,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Your Name (e.g. Kwame A.)',
                    hintStyle: GoogleFonts.poppins(color: AppTheme.textMuted, fontSize: 12),
                    filled: true,
                    fillColor: Colors.black,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: commentCtrl,
                  maxLines: 2,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Your review comment...',
                    hintStyle: GoogleFonts.poppins(color: AppTheme.textMuted, fontSize: 12),
                    filled: true,
                    fillColor: Colors.black,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Cancel', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      setDialogState(() => isSubmitting = true);
                      try {
                        final res = await FirebaseService().submitProductReview(
                          productId: product.productId.isNotEmpty ? product.productId : product.id,
                          rating: selectedRating.toDouble(),
                          comment: commentCtrl.text.trim(),
                          userName: nameCtrl.text.trim().isNotEmpty
                              ? nameCtrl.text.trim()
                              : 'Verified Buyer',
                        );
                        if (context.mounted) {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppTheme.emerald,
                              content: Text(
                                'Rating saved! Catalog updated to ${res['newRating']} ★',
                              ),
                            ),
                          );
                        }
                      } catch (e) {
                        setDialogState(() => isSubmitting = false);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryAmber,
                foregroundColor: Colors.black,
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
                  : Text('Submit', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
