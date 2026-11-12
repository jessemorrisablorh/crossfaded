import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../models/delivery_settings.dart';
import '../services/firebase_service.dart';
import '../services/delivery_calculator.dart';
import '../services/places_service.dart';

class DeliveryProvider extends ChangeNotifier {
  final FirebaseService _firebaseService = FirebaseService();

  DeliverySettings _settings = const DeliverySettings();

  String _address = '';
  String? _placename;
  double? _lat;
  double? _lng;
  double _distanceKm = 0.0;
  bool _isLocating = false;

  DeliverySettings get settings => _settings;
  String get address => _address;
  String? get placename => _placename;
  double? get lat => _lat;
  double? get lng => _lng;
  double get distanceKm => _distanceKm;
  bool get isLocating => _isLocating;

  DeliveryProvider() {
    _init();
  }

  void _init() {
    _firebaseService.streamDeliverySettings().listen((s) {
      _settings = s;
      _recalculateDistance();
      notifyListeners();
    });
  }

  void setDestination({
    required String address,
    String? placename,
    double? lat,
    double? lng,
  }) {
    _address = address;
    _placename = placename;
    _lat = lat;
    _lng = lng;
    _recalculateDistance();
    notifyListeners();
  }

  void _recalculateDistance() {
    if (_lat != null && _lng != null) {
      _distanceKm = DeliveryCalculator.calculateDistanceKm(
        lat1: _settings.pickupLat,
        lon1: _settings.pickupLng,
        lat2: _lat!,
        lon2: _lng!,
      );
    } else {
      _distanceKm = 0.0;
    }
  }

  double calculateFee(double cartSubtotal) {
    return DeliveryCalculator.calculateDeliveryFee(
      distanceKm: _distanceKm,
      settings: _settings,
      cartTotal: cartSubtotal,
    );
  }

  /// Request user's device GPS location
  Future<bool> captureCurrentLocation() async {
    _isLocating = true;
    notifyListeners();

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _isLocating = false;
        notifyListeners();
        return false;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _isLocating = false;
          notifyListeners();
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _isLocating = false;
        notifyListeners();
        return false;
      }

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      _lat = (pos.latitude * 10000).round() / 10000.0;
      _lng = (pos.longitude * 10000).round() / 10000.0;
      _address = 'Current GPS Location (${_lat!}, ${_lng!})';
      _placename = 'Detected Location';
      _recalculateDistance();

      _isLocating = false;
      notifyListeners();
      return true;
    } catch (_) {
      _isLocating = false;
      notifyListeners();
      return false;
    }
  }

  Future<List<PlaceSuggestion>> searchPlaces(String query) async {
    return await PlacesService.searchPlaces(
      query: query,
      apiKey: _settings.googlePlacesApiKey,
    );
  }

  Future<void> selectPlace(PlaceSuggestion suggestion) async {
    _address = suggestion.description;
    _placename = suggestion.mainText;
    notifyListeners();

    final coords = await PlacesService.getPlaceCoordinates(
      placeId: suggestion.placeId,
      apiKey: _settings.googlePlacesApiKey,
    );

    if (coords != null) {
      _lat = (coords.lat * 10000).round() / 10000.0;
      _lng = (coords.lng * 10000).round() / 10000.0;
      if (coords.address.isNotEmpty) {
        _address = coords.address;
      }
      _recalculateDistance();
      notifyListeners();
    }
  }
}

