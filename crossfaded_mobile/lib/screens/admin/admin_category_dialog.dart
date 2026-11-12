import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/category.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/image_upload_field.dart';

class AdminCategoryDialog extends StatefulWidget {
  final Category? categoryToEdit;

  const AdminCategoryDialog({Key? key, this.categoryToEdit}) : super(key: key);

  static Future<void> show(BuildContext context, [Category? category]) {
    return showDialog(
      context: context,
      builder: (_) => AdminCategoryDialog(categoryToEdit: category),
    );
  }

  @override
  State<AdminCategoryDialog> createState() => _AdminCategoryDialogState();
}

class _AdminCategoryDialogState extends State<AdminCategoryDialog> {
  final _formKey = GlobalKey<FormState>();
  final FirebaseService _firebaseService = FirebaseService();

  late TextEditingController _nameCtrl;
  late TextEditingController _slugCtrl;
  late TextEditingController _imageUrlCtrl;
  late TextEditingController _descCtrl;
  bool _isSaving = false;

  bool get isEditing => widget.categoryToEdit != null;

  @override
  void initState() {
    super.initState();
    final c = widget.categoryToEdit;
    _nameCtrl = TextEditingController(text: c?.name ?? '');
    _slugCtrl = TextEditingController(text: c?.slug ?? '');
    _imageUrlCtrl = TextEditingController(text: c?.imageUrl ?? '');
    _descCtrl = TextEditingController(text: c?.description ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _slugCtrl.dispose();
    _imageUrlCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final name = _nameCtrl.text.trim();
    final slug = _slugCtrl.text.trim().isNotEmpty
        ? _slugCtrl.text.trim()
        : name.toLowerCase().replaceAll(RegExp(r'\s+'), '-');
    final image = _imageUrlCtrl.text.trim().isNotEmpty
        ? _imageUrlCtrl.text.trim()
        : '/images/crushers.jpeg';
    final desc = _descCtrl.text.trim();

    try {
      if (isEditing) {
        await _firebaseService.updateCategory(widget.categoryToEdit!.id, {
          'name': name,
          'slug': slug,
          'imageUrl': image,
          'image': image,
          'description': desc,
        });
      } else {
        final newCat = Category(
          id: '',
          categoryId: '',
          name: name,
          slug: slug,
          imageUrl: image,
          description: desc,
        );
        await _firebaseService.createCategory(newCat);
      }

      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.emeraldBg,
          content: Text(
            isEditing ? 'Category updated.' : 'Category created.',
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
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF141414),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.border),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isEditing ? 'EDIT CATEGORY' : 'NEW CATEGORY',
                      style: GoogleFonts.anton(
                        fontSize: 18,
                        color: AppTheme.primaryAmber,
                        letterSpacing: 1.2,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textMuted, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Category Image Upload Widget (Camera / Device)
                ImageUploadField(
                  imageUrl: _imageUrlCtrl.text.trim(),
                  label: 'CATEGORY BANNER (CAMERA / DEVICE UPLOAD)',
                  folder: 'categories',
                  height: 140,
                  onChanged: (newUrl) {
                    setState(() {
                      _imageUrlCtrl.text = newUrl;
                    });
                  },
                ),
                const SizedBox(height: 14),

                // Name
                TextFormField(
                  controller: _nameCtrl,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                  validator: (val) => val == null || val.isEmpty ? 'Name required' : null,
                  decoration: InputDecoration(
                    labelText: 'Category Name *',
                    hintText: 'e.g. Rolling Trays',
                    filled: true,
                    fillColor: AppTheme.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 10),

                // Slug
                TextFormField(
                  controller: _slugCtrl,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Slug (Optional)',
                    hintText: 'e.g. rolling-trays',
                    filled: true,
                    fillColor: AppTheme.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 10),

                // Description
                TextFormField(
                  controller: _descCtrl,
                  maxLines: 2,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Description',
                    hintText: 'Brief summary of this curated collection...',
                    filled: true,
                    fillColor: AppTheme.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 18),

                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: AppTheme.border),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('CANCEL'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryAmber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                              )
                            : Text(
                                isEditing ? 'UPDATE' : 'CREATE',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

