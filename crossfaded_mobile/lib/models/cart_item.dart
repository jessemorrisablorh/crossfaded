class CartItem {
  final String id;
  final String productId;
  final String productName;
  final String productImage;
  final double price;
  int quantity;
  final String? uid;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImage,
    required this.price,
    this.quantity = 1,
    this.uid,
  });

  double get total => price * quantity;

  factory CartItem.fromMap(Map<String, dynamic> data, String docId) {
    return CartItem(
      id: docId,
      productId: data['productId'] ?? data['productid'] ?? docId,
      productName: data['productname'] ?? data['name'] ?? '',
      productImage: data['productimage'] ?? data['image'] ?? '',
      price: (data['price'] is num) ? (data['price'] as num).toDouble() : 0.0,
      quantity: (data['quantity'] is num) ? (data['quantity'] as num).toInt() : 1,
      uid: data['uid'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'productid': productId,
      'productname': productName,
      'productimage': productImage,
      'price': price,
      'quantity': quantity,
      'uid': uid,
    };
  }

  CartItem copyWith({int? quantity}) {
    return CartItem(
      id: id,
      productId: productId,
      productName: productName,
      productImage: productImage,
      price: price,
      quantity: quantity ?? this.quantity,
      uid: uid,
    );
  }
}

