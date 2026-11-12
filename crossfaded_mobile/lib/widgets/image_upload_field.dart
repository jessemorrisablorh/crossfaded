import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/image_upload_service.dart';
import '../theme/app_theme.dart';
import 'app_image.dart';

/// Standard, reusable Image Upload Widget for CrossFaded Mobile.
/// Use this everywhere an image is required instead of asking for a raw URL.
///
/// Features:
/// - Tap to choose between Device Camera, Gallery/File Upload, or Web URL
/// - Automatic Firebase Storage upload with inline data-URL fallback
/// - Live loading spinner during upload
/// - High-resolution preview with "Change" and "Remove" actions
///
/// Usage Example:
/// ```dart
/// ImageUploadField(
///   imageUrl: _imageUrl,
///   folder: 'products',
///   onChanged: (newUrl) => setState(() => _imageUrl = newUrl),
/// )
/// ```
class ImageUploadField extends StatefulWidget {
  final String imageUrl;
  final ValueChanged<String> onChanged;
  final String label;
  final String folder;
  final String fallbackAsset;
  final double height;
  final bool isRequired;

  const ImageUploadField({
    Key? key,
    required this.imageUrl,
    required this.onChanged,
    this.label = 'PRODUCT / CATEGORY IMAGE',
    this.folder = 'products',
    this.fallbackAsset = 'assets/images/crushers.jpeg',
    this.height = 190,
    this.isRequired = false,
  }) : super(key: key);

  @override
  State<ImageUploadField> createState() => _ImageUploadFieldState();
}

class _ImageUploadFieldState extends State<ImageUploadField> {
  bool _isUploading = false;

  Future<void> _handleUpload() async {
    final result = await ImageUploadService.pickAndUploadImage(
      context,
      folder: widget.folder,
      onUploadingChanged: (uploading) {
        if (mounted) setState(() => _isUploading = uploading);
      },
    );

    if (result != null && result.isNotEmpty) {
      widget.onChanged(result);
    }
  }

  void _handleRemove() {
    widget.onChanged('');
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = widget.imageUrl.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              widget.label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.1,
                color: AppTheme.primaryAmber,
              ),
            ),
            if (widget.isRequired)
              Text(
                '* Required',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  color: AppTheme.textMuted,
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),

        // Preview or Upload Trigger Box
        Container(
          width: double.infinity,
          height: widget.height,
          decoration: BoxDecoration(
            color: const Color(0xFF141414),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: hasImage ? AppTheme.border : AppTheme.primaryAmber.withOpacity(0.4),
              width: hasImage ? 1 : 1.5,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (hasImage) ...[
                // Image Display
                AppImage(
                  imageUrl: widget.imageUrl,
                  fit: BoxFit.cover,
                  fallbackAsset: widget.fallbackAsset,
                ),
                // Gradient Scrim for contrast
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.transparent, Colors.black.withOpacity(0.85)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ),
                // Action Buttons Overlay
                Positioned(
                  bottom: 10,
                  left: 12,
                  right: 12,
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _isUploading ? null : _handleUpload,
                          icon: const Icon(Icons.flip_camera_ios, size: 16),
                          label: Text(
                            'Change Photo',
                            style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.black.withOpacity(0.85),
                            foregroundColor: AppTheme.primaryAmber,
                            side: const BorderSide(color: AppTheme.primaryAmber),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: _isUploading ? null : _handleRemove,
                        icon: const Icon(Icons.delete_outline, color: AppTheme.danger, size: 20),
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.black.withOpacity(0.85),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                            side: BorderSide(color: AppTheme.danger.withOpacity(0.5)),
                          ),
                        ),
                        tooltip: 'Remove Image',
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // No Image Empty State / Upload Button
                InkWell(
                  onTap: _isUploading ? null : _handleUpload,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryAmber.withOpacity(0.12),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppTheme.primaryAmber.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          child: const Icon(
                            Icons.add_a_photo_rounded,
                            color: AppTheme.primaryAmber,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Upload Image',
                          style: GoogleFonts.raleway(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tap to use Device Camera or Upload from Device',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              // Uploading overlay
              if (_isUploading)
                Container(
                  color: Colors.black.withOpacity(0.75),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(color: AppTheme.primaryAmber),
                        const SizedBox(height: 12),
                        Text(
                          'Uploading Image...',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primaryAmber,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

