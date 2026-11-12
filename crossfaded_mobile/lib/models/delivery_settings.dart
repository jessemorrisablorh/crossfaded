class DeliverySettings {
  final String googlePlacesApiKey;
  final String pickupAddress;
  final double pickupLat;
  final double pickupLng;
  final double startFare;
  final double ratePerKm;
  final double ratePerMin;
  final double bookingFeePercent;
  final double minimumFee;
  final double minutesPerKm;
  final double freeDeliveryThreshold;

  const DeliverySettings({
    this.googlePlacesApiKey = 'AIzaSyBhMT_jtJCSaZiqUg44CzsKwqXPjgG7Gxc',
    this.pickupAddress = 'CrossFaded Flagship Store, East Legon, Accra, Ghana',
    this.pickupLat = 5.6425,
    this.pickupLng = -0.1582,
    this.startFare = 3.15,
    this.ratePerKm = 1.45,
    this.ratePerMin = 0.54,
    this.bookingFeePercent = 6.1,
    this.minimumFee = 15.0,
    this.minutesPerKm = 2.0,
    this.freeDeliveryThreshold = 500.0,
  });

  factory DeliverySettings.fromMap(Map<String, dynamic> data) {
    return DeliverySettings(
      googlePlacesApiKey: data['googlePlacesApiKey'] ?? 'AIzaSyBhMT_jtJCSaZiqUg44CzsKwqXPjgG7Gxc',
      pickupAddress: data['pickupAddress'] ?? 'CrossFaded Flagship Store, East Legon, Accra, Ghana',
      pickupLat: (data['pickupLat'] is num) ? (data['pickupLat'] as num).toDouble() : 5.6425,
      pickupLng: (data['pickupLng'] is num) ? (data['pickupLng'] as num).toDouble() : -0.1582,
      startFare: (data['startFare'] is num)
          ? (data['startFare'] as num).toDouble()
          : (data['baseFee'] is num ? (data['baseFee'] as num).toDouble() : 3.15),
      ratePerKm: (data['ratePerKm'] is num) ? (data['ratePerKm'] as num).toDouble() : 1.45,
      ratePerMin: (data['ratePerMin'] is num) ? (data['ratePerMin'] as num).toDouble() : 0.54,
      bookingFeePercent: (data['bookingFeePercent'] is num) ? (data['bookingFeePercent'] as num).toDouble() : 6.1,
      minimumFee: (data['minimumFee'] is num) ? (data['minimumFee'] as num).toDouble() : 15.0,
      minutesPerKm: (data['minutesPerKm'] is num) ? (data['minutesPerKm'] as num).toDouble() : 2.0,
      freeDeliveryThreshold: (data['freeDeliveryThreshold'] is num)
          ? (data['freeDeliveryThreshold'] as num).toDouble()
          : 500.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'googlePlacesApiKey': googlePlacesApiKey,
      'pickupAddress': pickupAddress,
      'pickupLat': pickupLat,
      'pickupLng': pickupLng,
      'startFare': startFare,
      'baseFee': startFare,
      'ratePerKm': ratePerKm,
      'ratePerMin': ratePerMin,
      'bookingFeePercent': bookingFeePercent,
      'minimumFee': minimumFee,
      'minutesPerKm': minutesPerKm,
      'freeDeliveryThreshold': freeDeliveryThreshold,
    };
  }
}

