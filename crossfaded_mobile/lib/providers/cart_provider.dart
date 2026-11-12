import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import '../models/product.dart';

class CartProvider extends ChangeNotifier {
  static const String _storageKey = 'crossfaded_cart_items_v1';
  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  int get totalCount => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => _items.fold(0.0, (sum, item) => sum + item.total);

  bool get isEmpty => _items.isEmpty;

  CartProvider() {
    _loadFromStorage();
  }

  void addToCart(Product product, {int quantity = 1}) {
    final existingIndex = _items.indexWhere(
      (item) => item.productId == product.productId || item.productId == product.id,
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(
        CartItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          productId: product.productId.isNotEmpty ? product.productId : product.id,
          productName: product.name,
          productImage: product.image,
          price: product.price,
          quantity: quantity,
        ),
      );
    }

    _saveToStorage();
    notifyListeners();
  }

  void updateQuantity(String productId, int newQuantity) {
    final index = _items.indexWhere(
      (item) => item.productId == productId || item.id == productId,
    );

    if (index >= 0) {
      if (newQuantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = newQuantity;
      }
      _saveToStorage();
      notifyListeners();
    }
  }

  void removeItem(String productId) {
    _items.removeWhere(
      (item) => item.productId == productId || item.id == productId,
    );
    _saveToStorage();
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _saveToStorage();
    notifyListeners();
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = _items.map((e) => e.toMap()).toList();
      await prefs.setString(_storageKey, json.encode(list));
    } catch (_) {}
  }

  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_storageKey);
      if (raw != null) {
        final decoded = json.decode(raw) as List;
        _items.clear();
        for (final item in decoded) {
          _items.add(CartItem.fromMap(Map<String, dynamic>.from(item), ''));
        }
        notifyListeners();
      }
    } catch (_) {}
  }
}

