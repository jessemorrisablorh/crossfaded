class Product {
  final String id;
  final String productId;
  final String name;
  final String description;
  final double price;
  final double? salePrice;
  final String categoryId;
  final String categoryName;
  final List<String> imageUrls;
  final String image;
  final int stock;
  final bool featured;
  final double rating;
  final int reviewsCount;
  final Map<String, dynamic>? specs;

  Product({
    required this.id,
    required this.productId,
    required this.name,
    required this.description,
    required this.price,
    this.salePrice,
    required this.categoryId,
    required this.categoryName,
    required this.imageUrls,
    required this.image,
    required this.stock,
    this.featured = false,
    this.rating = 4.9,
    this.reviewsCount = 12,
    this.specs,
  });

  factory Product.fromMap(Map<String, dynamic> data, String docId) {
    List<String> images = [];
    if (data['imageUrls'] is List) {
      images = (data['imageUrls'] as List).map((e) => e.toString()).toList();
    } else if (data['image'] != null && data['image'].toString().isNotEmpty) {
      images = [data['image'].toString()];
    }

    final mainImage = images.isNotEmpty ? images.first : (data['image']?.toString() ?? '');

    return Product(
      id: docId,
      productId: data['productId'] ?? docId,
      name: data['name'] ?? '',
      description: data['description'] ?? '',
      price: (data['price'] is num) ? (data['price'] as num).toDouble() : 0.0,
      salePrice: (data['salePrice'] is num) ? (data['salePrice'] as num).toDouble() : null,
      categoryId: data['categoryId'] ?? '',
      categoryName: data['categoryName'] ?? data['category'] ?? 'General',
      imageUrls: images,
      image: mainImage,
      stock: (data['stock'] is num) ? (data['stock'] as num).toInt() : 10,
      featured: data['featured'] == true,
      rating: (data['rating'] is num) ? (data['rating'] as num).toDouble() : 4.9,
      reviewsCount: (data['reviewsCount'] is num) ? (data['reviewsCount'] as num).toInt() : 12,
      specs: data['specs'] is Map ? Map<String, dynamic>.from(data['specs']) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'name': name,
      'description': description,
      'price': price,
      'salePrice': salePrice,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'category': categoryName,
      'imageUrls': imageUrls,
      'image': image,
      'stock': stock,
      'featured': featured,
      'rating': rating,
      'reviewsCount': reviewsCount,
      'specs': specs,
    };
  }
}

