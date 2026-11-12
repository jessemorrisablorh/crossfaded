import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/order.dart';
import '../models/delivery_settings.dart';
import '../models/user_profile.dart';

class FirebaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // --------------------------------------------------------------------------
  // PRODUCTS STREAM
  // --------------------------------------------------------------------------
  Stream<List<Product>> streamProducts() {
    return _db.collection('products').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return Product.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  // --------------------------------------------------------------------------
  // CATEGORIES STREAM
  // --------------------------------------------------------------------------
  Stream<List<Category>> streamCategories() {
    return _db.collection('categories').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) {
        return Category.fromMap(doc.data(), doc.id);
      }).toList();
    });
  }

  // --------------------------------------------------------------------------
  // DELIVERY SETTINGS STREAM
  // --------------------------------------------------------------------------
  Stream<DeliverySettings> streamDeliverySettings() {
    return _db
        .collection('settings')
        .doc('delivery_settings')
        .snapshots()
        .map((doc) {
      if (doc.exists && doc.data() != null) {
        return DeliverySettings.fromMap(doc.data()!);
      }
      return const DeliverySettings();
    });
  }

  Future<DeliverySettings> getDeliverySettings() async {
    try {
      final doc = await _db.collection('settings').doc('delivery_settings').get();
      if (doc.exists && doc.data() != null) {
        return DeliverySettings.fromMap(doc.data()!);
      }
    } catch (_) {}
    return const DeliverySettings();
  }

  // --------------------------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------------------------
  Future<String> createOrder(OrderModel order) async {
    final docRef = _db.collection('orders').doc();
    final data = order.toMap();
    data['id'] = docRef.id;
    await docRef.set(data);
    return docRef.id;
  }

  Future<OrderModel?> getOrderById(String orderId) async {
    final cleanId = orderId.trim();
    if (cleanId.isEmpty) return null;

    try {
      final doc = await _db.collection('orders').doc(cleanId).get();
      if (doc.exists && doc.data() != null) {
        return OrderModel.fromMap(doc.data()!, doc.id);
      }

      final numQuery = await _db
          .collection('orders')
          .where('orderNumber', isEqualTo: cleanId.toUpperCase())
          .limit(1)
          .get();

      if (numQuery.docs.isNotEmpty) {
        final d = numQuery.docs.first;
        return OrderModel.fromMap(d.data(), d.id);
      }
    } catch (_) {}
    return null;
  }

  Stream<OrderModel?> streamOrderById(String orderId) {
    final cleanId = orderId.trim();
    if (cleanId.isEmpty) {
      return Stream.value(null);
    }

    // Direct doc snapshot
    return _db.collection('orders').doc(cleanId).snapshots().asyncMap((doc) async {
      if (doc.exists && doc.data() != null) {
        return OrderModel.fromMap(doc.data()!, doc.id);
      }

      // Query by orderNumber (e.g. CF-482915)
      final numQuery = await _db
          .collection('orders')
          .where('orderNumber', isEqualTo: cleanId.toUpperCase())
          .limit(1)
          .get();

      if (numQuery.docs.isNotEmpty) {
        final d = numQuery.docs.first;
        return OrderModel.fromMap(d.data(), d.id);
      }

      return null;
    });
  }

  Stream<List<OrderModel>> streamUserOrders(String uid) {
    if (uid.isEmpty) return Stream.value([]);
    return _db
        .collection('orders')
        .where('uid', isEqualTo: uid)
        .snapshots()
        .map((snapshot) {
      final list = snapshot.docs
          .map((doc) => OrderModel.fromMap(doc.data(), doc.id))
          .toList();
      list.sort((a, b) {
        if (a.dateCreated == null || b.dateCreated == null) return 0;
        return b.dateCreated!.compareTo(a.dateCreated!);
      });
      return list;
    });
  }

  // Stream all orders (for Admin Fulfillment Dashboard & Ring Alert)
  Stream<List<OrderModel>> streamAllOrders() {
    return _db.collection('orders').snapshots().map((snapshot) {
      final list = snapshot.docs
          .map((doc) => OrderModel.fromMap(doc.data(), doc.id))
          .toList();
      list.sort((a, b) {
        if (a.dateCreated == null || b.dateCreated == null) return 0;
        return b.dateCreated!.compareTo(a.dateCreated!);
      });
      return list;
    });
  }

  // Update order status (Admin)
  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    await _db.collection('orders').doc(orderId).update({
      'status': newStatus,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // Stream orders by IDs (for buyer notifications)
  Stream<List<OrderModel>> streamOrdersByIds(List<String> orderIds) {
    if (orderIds.isEmpty) return Stream.value([]);
    final slice = orderIds.take(20).toList();
    return _db
        .collection('orders')
        .where(FieldPath.documentId, whereIn: slice)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => OrderModel.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  // --------------------------------------------------------------------------
  // USER PROFILE
  // --------------------------------------------------------------------------
  Future<UserProfile?> getUserProfile(String uid) async {
    try {
      final doc = await _db.collection('users').doc(uid).get();
      if (doc.exists && doc.data() != null) {
        return UserProfile.fromMap(doc.data()!, uid);
      }
    } catch (_) {}
    return null;
  }

  Future<void> updateUserProfile(String uid, Map<String, dynamic> data) async {
    await _db.collection('users').doc(uid).set(data, SetOptions(merge: true));
  }

  // --------------------------------------------------------------------------
  // HERO SLIDERS
  // --------------------------------------------------------------------------
  Stream<List<Map<String, dynamic>>> streamSliders() {
    return _db.collection('sliders').snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
    });
  }

  // --------------------------------------------------------------------------
  // ADMIN: PRODUCTS CRUD
  // --------------------------------------------------------------------------
  Future<String> createProduct(Product product) async {
    final docRef = _db.collection('products').doc();
    final data = product.toMap();
    data['id'] = docRef.id;
    data['productId'] = docRef.id;
    data['createdAt'] = FieldValue.serverTimestamp();
    await docRef.set(data);
    return docRef.id;
  }

  Future<void> updateProduct(String productId, Map<String, dynamic> data) async {
    data['updatedAt'] = FieldValue.serverTimestamp();
    await _db.collection('products').doc(productId).set(data, SetOptions(merge: true));
  }

  Future<void> deleteProduct(String productId) async {
    await _db.collection('products').doc(productId).delete();
  }

  // --------------------------------------------------------------------------
  // ADMIN: CATEGORIES CRUD
  // --------------------------------------------------------------------------
  Future<String> createCategory(Category category) async {
    final docRef = _db.collection('categories').doc();
    final data = category.toMap();
    data['id'] = docRef.id;
    data['categoryId'] = docRef.id;
    data['createdAt'] = FieldValue.serverTimestamp();
    await docRef.set(data);
    return docRef.id;
  }

  Future<void> updateCategory(String categoryId, Map<String, dynamic> data) async {
    data['updatedAt'] = FieldValue.serverTimestamp();
    await _db.collection('categories').doc(categoryId).set(data, SetOptions(merge: true));
  }

  Future<void> deleteCategory(String categoryId) async {
    await _db.collection('categories').doc(categoryId).delete();
  }

  // --------------------------------------------------------------------------
  // ADMIN: USERS MANAGEMENT
  // --------------------------------------------------------------------------
  Stream<List<UserProfile>> streamAllUsers() {
    return _db.collection('users').snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => UserProfile.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  Future<void> toggleBlockUser(String uid, bool isBlocked) async {
    await _db.collection('users').doc(uid).set({
      'isBlocked': isBlocked,
      'status': isBlocked ? 'blocked' : 'active',
      'blockedAt': isBlocked ? FieldValue.serverTimestamp() : null,
    }, SetOptions(merge: true));
  }

  // --------------------------------------------------------------------------
  // ADMIN: BROADCAST PUSH NOTIFICATIONS
  // --------------------------------------------------------------------------
  Future<String> sendBroadcastNotification({
    required String title,
    required String message,
    String? target,
    String? sentBy,
  }) async {
    final docRef = _db.collection('notifications').doc();
    await docRef.set({
      'id': docRef.id,
      'title': title.trim(),
      'message': message.trim(),
      'target': target ?? 'all',
      'sentBy': sentBy ?? 'Admin',
      'createdAt': FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  Stream<List<Map<String, dynamic>>> streamBroadcastNotifications() {
    return _db
        .collection('notifications')
        .orderBy('createdAt', descending: true)
        .limit(30)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
    });
  }

  // --------------------------------------------------------------------------
  // REVIEWS & RATINGS
  // --------------------------------------------------------------------------
  Future<Map<String, dynamic>> submitProductReview({
    required String productId,
    required double rating,
    required String comment,
    String userName = 'Verified Buyer',
    String? orderId,
  }) async {
    final docRef = _db.collection('products').doc(productId);
    final snap = await docRef.get();

    double currentRating = 4.9;
    int currentReviewsCount = 10;

    if (snap.exists && snap.data() != null) {
      final d = snap.data()!;
      if (d['rating'] != null) {
        currentRating = (d['rating'] is num) ? (d['rating'] as num).toDouble() : 4.9;
      }
      if (d['reviewsCount'] != null) {
        currentReviewsCount = (d['reviewsCount'] is num) ? (d['reviewsCount'] as num).toInt() : 10;
      }
    }

    final newCount = currentReviewsCount + 1;
    final rawAverage = ((currentRating * currentReviewsCount) + rating) / newCount;
    final newRating = double.parse(rawAverage.toStringAsFixed(1));

    await docRef.set({
      'rating': newRating,
      'reviewsCount': newCount,
    }, SetOptions(merge: true));

    final reviewRef = _db.collection('reviews').doc();
    final reviewData = {
      'reviewId': reviewRef.id,
      'productId': productId,
      'orderId': orderId,
      'rating': rating,
      'comment': comment.trim(),
      'userName': userName.trim().isNotEmpty ? userName.trim() : 'Verified Buyer',
      'createdAt': FieldValue.serverTimestamp(),
    };
    await reviewRef.set(reviewData);

    try {
      await docRef.collection('reviews').doc(reviewRef.id).set(reviewData);
    } catch (_) {}

    return {
      'newRating': newRating,
      'newReviewsCount': newCount,
    };
  }
}

