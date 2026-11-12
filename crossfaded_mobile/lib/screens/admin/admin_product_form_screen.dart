import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/image_upload_field.dart';

class AdminProductFormScreen extends StatefulWidget {
  final Product? productToEdit;

  const AdminProductFormScreen({Key? key, this.productToEdit}) : super(key: key);

  @override
  State<AdminProductFormScreen> createState() => _AdminProductFormScreenState();
}

class _AdminProductFormScreenState extends State<AdminProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final FirebaseService _firebaseService = FirebaseService();

  late TextEditingController _nameCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _priceCtrl;
  late TextEditingController _salePriceCtrl;
  late TextEditingController _stockCtrl;
  late TextEditingController _imageUrlCtrl;

  String? _selectedCategory;
  String? _selectedCategoryName;
  bool _isFeatured = false;
  bool _isSaving = false;
  List<Category> _categories = [];

  bool get isEditing => widget.productToEdit != null;

  @override
  void initState() {
    super.initState();
    final p = widget.productToEdit;
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _descCtrl = TextEditingController(text: p?.description ?? '');
    _priceCtrl = TextEditingController(text: p != null ? p.price.toStringAsFixed(2) : '');
    _salePriceCtrl = TextEditingController(
        text: (p?.salePrice != null) ? p!.salePrice!.toStringAsFixed(2) : '');
    _stockCtrl = TextEditingController(text: p != null ? p.stock.toString() : '20');
    _imageUrlCtrl = TextEditingController(text: p?.image ?? '');
    _isFeatured = p?.featured ?? false;
    _selectedCategory = p?.categoryId;
    _selectedCategoryName = p?.categoryName;

    _loadCategories();
  }

  void _loadCategories() {
    _firebaseService.streamCategories().listen((cats) {
      if (mounted) {
        setState(() {
          _categories = cats;
          if (_selectedCategory == null && cats.isNotEmpty) {
            _selectedCategory = cats.first.categoryId;
            _selectedCategoryName = cats.first.name;
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _salePriceCtrl.dispose();
    _stockCtrl.dispose();
    _imageUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _saveProduct() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final price = double.tryParse(_priceCtrl.text.trim()) ?? 0.0;
      final salePrice = _salePriceCtrl.text.trim().isNotEmpty
          ? double.tryParse(_salePriceCtrl.text.trim())
          : null;
      final stock = int.tryParse(_stockCtrl.text.trim()) ?? 10;
      final image = _imageUrlCtrl.text.trim().isNotEmpty
          ? _imageUrlCtrl.text.trim()
          : '/images/crushers.jpeg';

      if (isEditing) {
        await _firebaseService.updateProduct(widget.productToEdit!.id, {
          'name': _nameCtrl.text.trim(),
          'description': _descCtrl.text.trim(),
          'price': price,
          'salePrice': salePrice,
          'stock': stock,
          'image': image,
          'imageUrls': [image],
          'categoryId': _selectedCategory ?? '',
          'categoryName': _selectedCategoryName ?? 'General',
          'category': _selectedCategoryName ?? 'General',
          'featured': _isFeatured,
        });
      } else {
        final newProduct = Product(
          id: '',
          productId: '',
          name: _nameCtrl.text.trim(),
          description: _descCtrl.text.trim(),
          price: price,
          salePrice: salePrice,
          stock: stock,
          image: image,
          imageUrls: [image],
          categoryId: _selectedCategory ?? '',
          categoryName: _selectedCategoryName ?? 'General',
          featured: _isFeatured,
        );
        await _firebaseService.createProduct(newProduct);
      }

      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.emeraldBg,
          content: Text(
            isEditing ? 'Product updated successfully.' : 'Product created successfully.',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      );
    } catch (e) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppTheme.errorRed, content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          isEditing ? 'EDIT PRODUCT' : 'NEW PRODUCT',
          style: GoogleFonts.anton(
            fontSize: 20,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.2,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _saveProduct,
            child: _isSaving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryAmber),
                  )
                : Text(
                    'SAVE',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image Uploader (Device Camera or Gallery)
              ImageUploadField(
                imageUrl: _imageUrlCtrl.text.trim(),
                label: 'PRODUCT IMAGE (CAMERA OR DEVICE UPLOAD)',
                folder: 'products',
                height: 190,
                onChanged: (newUrl) {
                  setState(() {
                    _imageUrlCtrl.text = newUrl;
                  });
                },
              ),
              const SizedBox(height: 18),

              // Product Name
              _textField(
                controller: _nameCtrl,
                label: 'Product Title *',
                hint: 'e.g. Vortex 4-Piece Matte Herb Crusher',
                validator: (val) => val == null || val.isEmpty ? 'Title required' : null,
              ),
              const SizedBox(height: 12),

              // Category Selector
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                dropdownColor: const Color(0xFF161616),
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Category *',
                  filled: true,
                  fillColor: AppTheme.card,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: _categories.map((c) {
                  return DropdownMenuItem<String>(
                    value: c.categoryId,
                    child: Text(c.name),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCategory = val;
                    final match = _categories.firstWhere((c) => c.categoryId == val);
                    _selectedCategoryName = match.name;
                  });
                },
              ),
              const SizedBox(height: 12),

              // Price & Sale Price
              Row(
                children: [
                  Expanded(
                    child: _textField(
                      controller: _priceCtrl,
                      label: 'Price (GH₵) *',
                      hint: '320.00',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (val) => val == null || val.isEmpty ? 'Price required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _textField(
                      controller: _salePriceCtrl,
                      label: 'Sale Price (GH₵)',
                      hint: 'Optional discount',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Stock Quantity
              _textField(
                controller: _stockCtrl,
                label: 'Stock Quantity *',
                hint: '20',
                keyboardType: TextInputType.number,
                validator: (val) => val == null || val.isEmpty ? 'Stock required' : null,
              ),
              const SizedBox(height: 12),

              // Description
              _textField(
                controller: _descCtrl,
                label: 'Description',
                hint: 'Product details, materials, dimensions, and specifications...',
                maxLines: 4,
              ),
              const SizedBox(height: 16),

              // Featured Switch
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                activeColor: AppTheme.primaryAmber,
                title: Text(
                  'Feature on Storefront Homepage',
                  style: GoogleFonts.poppins(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600),
                ),
                subtitle: Text(
                  'Featured items appear in Bestsellers and category highlights.',
                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                ),
                value: _isFeatured,
                onChanged: (val) => setState(() => _isFeatured = val),
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveProduct,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryAmber,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                        )
                      : Text(
                          isEditing ? 'UPDATE PRODUCT' : 'CREATE PRODUCT',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _textField({
    required TextEditingController controller,
    required String label,
    String? hint,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      onChanged: onChanged,
      style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: AppTheme.card,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}

