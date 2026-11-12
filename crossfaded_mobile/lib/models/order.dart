import 'package:cloud_firestore/cloud_firestore.dart';

class OrderModel {
  final String id;
  final String orderNumber;
  final String? uid;
  final String customerName;
  final String email;
  final String phone;
  final String address;
  final String? placename;
  final String city;
  final String region;
  final double? lat;
  final double? lng;
  final double? distanceKm;
  final double deliveryFee;
  final double subtotal;
  final double total;
  final String status;
  final bool paid;
  final String paymentMethod;
  final String paymentMethodTitle;
  final List<OrderItem> cartItems;
  final DateTime? dateCreated;

  OrderModel({
    required this.id,
    required this.orderNumber,
    this.uid,
    required this.customerName,
    required this.email,
    required this.phone,
    required this.address,
    this.placename,
    required this.city,
    required this.region,
    this.lat,
    this.lng,
    this.distanceKm,
    required this.deliveryFee,
    required this.subtotal,
    required this.total,
    this.status = 'pending',
    this.paid = false,
    this.paymentMethod = 'cod',
    this.paymentMethodTitle = 'Payment on delivery',
    required this.cartItems,
    this.dateCreated,
  });

  factory OrderModel.fromMap(Map<String, dynamic> data, String docId) {
    List<OrderItem> items = [];
    if (data['cartitems'] is List) {
      items = (data['cartitems'] as List)
          .map((item) => OrderItem.fromMap(Map<String, dynamic>.from(item)))
          .toList();
    }

    DateTime? created;
    if (data['date_created'] is Timestamp) {
      created = (data['date_created'] as Timestamp).toDate();
    } else if (data['createdAt'] is Timestamp) {
      created = (data['createdAt'] as Timestamp).toDate();
    }

    final cName = data['customerName'] ??
        '${data['firstname'] ?? ''} ${data['lastname'] ?? ''}'.trim();

    return OrderModel(
      id: docId,
      orderNumber: data['orderNumber'] ?? 'CF-${docId.substring(0, 6).toUpperCase()}',
      uid: data['uid'],
      customerName: cName.isNotEmpty ? cName : 'Valued Customer',
      email: data['email'] ?? '',
      phone: data['phone'] ?? '',
      address: data['address'] ?? '',
      placename: data['placename'],
      city: data['city'] ?? 'Accra',
      region: data['region'] ?? 'Greater Accra',
      lat: (data['lat'] is num) ? (data['lat'] as num).toDouble() : null,
      lng: (data['lng'] is num) ? (data['lng'] as num).toDouble() : null,
      distanceKm: (data['distance_km'] is num) ? (data['distance_km'] as num).toDouble() : null,
      deliveryFee: (data['delivery_fee'] is num) ? (data['delivery_fee'] as num).toDouble() : 0.0,
      subtotal: (data['subtotal'] is num) ? (data['subtotal'] as num).toDouble() : 0.0,
      total: (data['total'] is num) ? (data['total'] as num).toDouble() : 0.0,
      status: data['status'] ?? 'pending',
      paid: data['paid'] == true,
      paymentMethod: data['payment_method'] ?? 'cod',
      paymentMethodTitle: data['payment_method_title'] ?? 'Payment on delivery',
      cartItems: items,
      dateCreated: created,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'orderNumber': orderNumber,
      'uid': uid,
      'customerName': customerName,
      'email': email,
      'phone': phone,
      'address': address,
      'placename': placename,
      'city': city,
      'region': region,
      'lat': lat,
      'lng': lng,
      'distance_km': distanceKm,
      'delivery_fee': deliveryFee,
      'subtotal': subtotal,
      'total': total,
      'status': status,
      'paid': paid,
      'payment_method': paymentMethod,
      'payment_method_title': paymentMethodTitle,
      'cartitems': cartItems.map((e) => e.toMap()).toList(),
      'date_created': FieldValue.serverTimestamp(),
      'day_created': DateTime.now().day,
      'month_created': DateTime.now().month,
      'year_created': DateTime.now().year,
    };
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final double price;
  final int quantity;
  final String? productImage;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    this.productImage,
  });

  factory OrderItem.fromMap(Map<String, dynamic> data) {
    return OrderItem(
      productId: data['productid'] ?? data['productId'] ?? '',
      productName: data['productname'] ?? data['name'] ?? '',
      price: (data['price'] is num) ? (data['price'] as num).toDouble() : 0.0,
      quantity: (data['quantity'] is num) ? (data['quantity'] as num).toInt() : 1,
      productImage: data['productimage'] ?? data['image'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productid': productId,
      'productId': productId,
      'productname': productName,
      'price': price,
      'quantity': quantity,
      'productimage': productImage,
    };
  }
}

