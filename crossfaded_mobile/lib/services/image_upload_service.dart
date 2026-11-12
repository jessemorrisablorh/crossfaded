import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import '../theme/app_theme.dart';

/// Reusable Image Upload Service for CrossFaded Mobile.
/// Provides camera capture, gallery selection, and Firebase Storage upload
/// with resilient inline Data URL fallback.
class ImageUploadService {
  static final ImagePicker _picker = ImagePicker();

  /// Prompts user with a luxury bottom sheet to pick from Camera or Device Gallery,
  /// with an optional URL fallback dialog.
  /// Returns the uploaded image URL string, or null if cancelled.
  static Future<String?> pickAndUploadImage(
    BuildContext context, {
    String folder = 'products',
    Function(bool isUploading)? onUploadingChanged,
  }) async {
    final source = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _buildSelectionSheet(ctx),
    );

    if (source == null) return null;

    if (source == 'url') {
      return await _showUrlInputDialog(context);
    }

    final imageSource = source == 'camera' ? ImageSource.camera : ImageSource.gallery;

    try {
      final XFile? picked = await _picker.pickImage(
        source: imageSource,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (picked == null) return null;

      onUploadingChanged?.call(true);

      final uploadedUrl = await uploadXFile(picked, folder: folder);
      return uploadedUrl;
    } catch (e) {
      debugPrint('Error picking or uploading image: $e');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Upload error: $e',
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 12),
            ),
            backgroundColor: AppTheme.danger,
          ),
        );
      }
      return null;
    } finally {
      onUploadingChanged?.call(false);
    }
  }

  /// Uploads an [XFile] to Firebase Storage with a resilient fallback.
  static Future<String> uploadXFile(
    XFile file, {
    String folder = 'uploads',
  }) async {
    final bytes = await file.readAsBytes();
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final randomSuffix = Random().nextInt(999999).toString().padLeft(6, '0');
    final extension = file.name.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
    final filePath = '$folder/${timestamp}_$randomSuffix.$extension';

    try {
      final storageRef = FirebaseStorage.instance.ref().child(filePath);
      final metadata = SettableMetadata(
        contentType: extension == 'png' ? 'image/png' : 'image/jpeg',
      );

      final uploadTask = await storageRef.putData(bytes, metadata);
      final downloadUrl = await uploadTask.ref.getDownloadURL();
      return downloadUrl;
    } catch (storageError) {
      debugPrint('Firebase Storage upload failed, falling back to data URL: $storageError');
      // Resilient fallback matching website imageUploadService.ts
      final base64String = base64Encode(bytes);
      final mimeType = extension == 'png' ? 'image/png' : 'image/jpeg';
      return 'data:$mimeType;base64,$base64String';
    }
  }

  /// Bottom sheet giving options: Camera vs Device Gallery vs URL
  static Widget _buildSelectionSheet(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      decoration: const BoxDecoration(
        color: Color(0xFF171717),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: AppTheme.border, width: 1.5),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'SELECT IMAGE SOURCE',
              style: GoogleFonts.anton(
                fontSize: 18,
                color: AppTheme.primaryAmber,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Capture a live photo with camera or choose from your device gallery',
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 20),

            // Option 1: Device Camera
            _buildOptionTile(
              context,
              icon: Icons.camera_alt_rounded,
              title: 'Use Device Camera',
              subtitle: 'Take a new high-quality photo instantly',
              color: AppTheme.primaryAmber,
              value: 'camera',
            ),
            const SizedBox(height: 12),

            // Option 2: Device Gallery / Upload
            _buildOptionTile(
              context,
              icon: Icons.photo_library_rounded,
              title: 'Upload from Device Gallery',
              subtitle: 'Select from photos, downloads, or albums',
              color: AppTheme.emerald,
              value: 'gallery',
            ),
            const SizedBox(height: 12),

            // Option 3: Image URL input (fallback)
            _buildOptionTile(
              context,
              icon: Icons.link_rounded,
              title: 'Paste Web Image URL',
              subtitle: 'Direct link to an existing web or asset image',
              color: AppTheme.textMuted,
              value: 'url',
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildOptionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required String value,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => Navigator.pop(context, value),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF212121),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.border),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: color.withOpacity(0.3)),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.raleway(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.textMuted),
            ],
          ),
        ),
      ),
    );
  }

  static Future<String?> _showUrlInputDialog(BuildContext context) async {
    final ctrl = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: AppTheme.border),
        ),
        title: Text(
          'PASTE IMAGE URL',
          style: GoogleFonts.anton(
            color: AppTheme.primaryAmber,
            fontSize: 18,
            letterSpacing: 1.0,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter a direct image link (e.g. https://... or /images/...):',
              style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              autofocus: true,
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'https://images.unsplash.com/...',
                hintStyle: GoogleFonts.poppins(color: AppTheme.textMuted, fontSize: 12),
                filled: true,
                fillColor: Colors.black,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppTheme.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppTheme.primaryAmber),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: GoogleFonts.poppins(color: AppTheme.textMuted),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              final text = ctrl.text.trim();
              if (text.isNotEmpty) {
                Navigator.pop(ctx, text);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryAmber,
              foregroundColor: Colors.black,
            ),
            child: Text(
              'Apply',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

