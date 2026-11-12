import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';

class AppImage extends StatelessWidget {
  final String imageUrl;
  final BoxFit fit;
  final double? width;
  final double? height;
  final String fallbackAsset;

  const AppImage({
    Key? key,
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.fallbackAsset = 'assets/images/cigar.png',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final clean = imageUrl.trim();

    if (clean.isEmpty) {
      return Image.asset(
        fallbackAsset,
        fit: fit,
        width: width,
        height: height,
      );
    }

    // 1. Network Image
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return CachedNetworkImage(
        imageUrl: clean,
        fit: fit,
        width: width,
        height: height,
        placeholder: (ctx, url) => Container(
          width: width,
          height: height,
          color: const Color(0xFF0F0F0F),
          child: const Center(
            child: SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppTheme.primaryAmber,
              ),
            ),
          ),
        ),
        errorWidget: (ctx, url, err) => Image.asset(
          fallbackAsset,
          fit: fit,
          width: width,
          height: height,
        ),
      );
    }

    // 2. Relative or assets path (e.g. "/images/crushers.jpeg" -> "assets/images/crushers.jpeg")
    String assetPath = clean;
    if (assetPath.startsWith('/images/')) {
      assetPath = 'assets$clean';
    } else if (assetPath.startsWith('/')) {
      assetPath = 'assets$clean';
    } else if (!assetPath.startsWith('assets/')) {
      assetPath = 'assets/images/$clean';
    }

    return Image.asset(
      assetPath,
      fit: fit,
      width: width,
      height: height,
      errorBuilder: (ctx, err, stack) => Image.asset(
        fallbackAsset,
        fit: fit,
        width: width,
        height: height,
      ),
    );
  }
}

