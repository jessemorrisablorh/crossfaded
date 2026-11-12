import 'package:flutter/foundation.dart' hide Category;
import '../models/product.dart';
import '../models/category.dart';
import '../services/firebase_service.dart';
import '../data/mock_data.dart';

class ProductProvider extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();

  List<Product> _products = List.from(MockData.initialProducts);
  List<Category> _categories = List.from(MockData.initialCategories);
  List<Map<String, dynamic>> _sliders = List.from(MockData.heroSliders);

  final bool _isLoading = false;
  String _selectedCategory = 'All';
  String _searchQuery = '';
  String _sortBy = 'featured'; // 'featured', 'price-low', 'price-high', 'rating'

  List<Product> get products => _products;
  List<Category> get categories => _categories;
  List<Map<String, dynamic>> get sliders => _sliders;
  bool get isLoading => _isLoading;
  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;
  String get sortBy => _sortBy;

  ProductProvider() {
    _init();
  }

  void _init() {
    // 1. Stream Products
    _firebaseService.streamProducts().listen((prods) {
      if (prods.isNotEmpty) {
        _products = prods;
        notifyListeners();
      }
    }, onError: (_) {
      // Keep mock data if offline
    });

    // 2. Stream Categories
    _firebaseService.streamCategories().listen((cats) {
      if (cats.isNotEmpty) {
        _categories = cats;
        notifyListeners();
      }
    }, onError: (_) {
      // Keep mock data
    });

    // 3. Stream Hero Sliders
    _firebaseService.streamSliders().listen((slides) {
      if (slides.isNotEmpty) {
        _sliders = slides;
        notifyListeners();
      }
    }, onError: (_) {
      // Keep mock data
    });
  }

  void setSelectedCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSortBy(String sort) {
    _sortBy = sort;
    notifyListeners();
  }

  List<Product> get filteredProducts {
    var list = List<Product>.from(_products);

    // 1. Filter by category
    if (_selectedCategory != 'All') {
      list = list.where((p) {
        return p.categoryName.toLowerCase() == _selectedCategory.toLowerCase() ||
            p.categoryId == _selectedCategory;
      }).toList();
    }

    // 2. Filter by search query
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      list = list.where((p) {
        return p.name.toLowerCase().contains(q) ||
            p.description.toLowerCase().contains(q) ||
            p.categoryName.toLowerCase().contains(q);
      }).toList();
    }

    // 3. Sorting
    switch (_sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price-high':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'rating':
        list.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.featured ? 1 : 0).compareTo(a.featured ? 1 : 0));
        break;
    }

    return list;
  }

  List<Product> get bestsellers {
    final list = _products.where((p) => p.featured).toList();
    return list.isNotEmpty ? list.take(6).toList() : _products.take(6).toList();
  }

  Product? getProductById(String id) {
    try {
      return _products.firstWhere((p) => p.id == id || p.productId == id);
    } catch (_) {
      return null;
    }
  }
}
