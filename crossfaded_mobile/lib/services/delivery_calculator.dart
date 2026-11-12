import 'dart:math';
import '../models/delivery_settings.dart';

class DeliveryCalculator {
  /// Calculate Haversine distance in KM between 2 GPS coordinates
  /// Includes 1.35x real-world road circuity factor for Accra road network
  static double calculateDistanceKm({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) {
    if (lat1 == 0 && lon1 == 0) return 0.0;
    if (lat2 == 0 && lon2 == 0) return 0.0;

    const double earthRadiusKm = 6371.0;
    final double dLat = _deg2rad(lat2 - lat1);
    final double dLon = _deg2rad(lon2 - lon1);

    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_deg2rad(lat1)) * cos(_deg2rad(lat2)) * sin(dLon / 2) * sin(dLon / 2);

    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    final double straightLineKm = earthRadiusKm * c;

    // Road circuity factor ~1.35 for Ghana road bends
    final double roadDistanceKm = straightLineKm * 1.35;
    return (roadDistanceKm * 10).round() / 10.0; // 1 decimal place
  }

  static double _deg2rad(double deg) => deg * (pi / 180.0);

  /// Calculate delivery fee based on dynamic Firestore settings
  static double calculateDeliveryFee({
    required double distanceKm,
    required DeliverySettings settings,
    double cartTotal = 0.0,
  }) {
    // 1. Free delivery threshold check
    if (settings.freeDeliveryThreshold > 0 && cartTotal >= settings.freeDeliveryThreshold) {
      return 0.0;
    }

    if (distanceKm <= 0) {
      return settings.minimumFee;
    }

    // 2. Component calculation
    final double distanceCharge = distanceKm * settings.ratePerKm;
    final double estimatedMinutes = distanceKm * settings.minutesPerKm;
    final double timeCharge = estimatedMinutes * settings.ratePerMin;

    // 3. Subtotal before booking fee
    final double subtotal = settings.startFare + distanceCharge + timeCharge;

    // 4. Booking dispatch fee percentage
    final double bookingFee = subtotal * (settings.bookingFeePercent / 100.0);

    // 5. Total fare before floor
    final double rawFare = subtotal + bookingFee;

    // 6. Minimum price floor
    final double finalFare = max(rawFare, settings.minimumFee);

    return (finalFare * 100).round() / 100.0;
  }
}

