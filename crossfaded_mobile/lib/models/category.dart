class Category {
  final String id;
  final String categoryId;
  final String name;
  final String slug;
  final String imageUrl;
  final String description;
  final int? productCount;

  Category({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.slug,
    required this.imageUrl,
    this.description = '',
    this.productCount,
  });

  factory Category.fromMap(Map<String, dynamic> data, String docId) {
    final catName = data['name'] ?? '';
    return Category(
      id: docId,
      categoryId: data['categoryId'] ?? docId,
      name: catName,
      slug: data['slug'] ?? catName.toLowerCase().replaceAll(RegExp(r'\s+'), '-'),
      imageUrl: data['imageUrl'] ?? data['image'] ?? '',
      description: data['description'] ?? '',
      productCount: data['productCount'] is num ? (data['productCount'] as num).toInt() : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'categoryId': categoryId,
      'name': name,
      'slug': slug,
      'imageUrl': imageUrl,
      'image': imageUrl,
      'description': description,
      'productCount': productCount,
    };
  }
}

