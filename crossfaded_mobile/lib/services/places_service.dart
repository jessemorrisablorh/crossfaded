import 'dart:convert';
import 'package:http/http.dart' as http;

class PlaceSuggestion {
  final String description;
  final String placeId;
  final String mainText;
  final String secondaryText;

  PlaceSuggestion({
    required this.description,
    required this.placeId,
    required this.mainText,
    required this.secondaryText,
  });

  factory PlaceSuggestion.fromJson(Map<String, dynamic> json) {
    final formatting = json['structured_formatting'] ?? {};
    return PlaceSuggestion(
      description: json['description'] ?? '',
      placeId: json['place_id'] ?? '',
      mainText: formatting['main_text'] ?? json['description'] ?? '',
      secondaryText: formatting['secondary_text'] ?? '',
    );
  }
}

class PlaceCoordinates {
  final double lat;
  final double lng;
  final String address;

  PlaceCoordinates({
    required this.lat,
    required this.lng,
    required this.address,
  });
}

class PlacesService {
  /// Fetch real-time address suggestions from Google Places API
  static Future<List<PlaceSuggestion>> searchPlaces({
    required String query,
    required String apiKey,
  }) async {
    if (query.trim().length < 2 || apiKey.trim().isEmpty) {
      return [];
    }

    try {
      final uri = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json'
        '?input=${Uri.encodeComponent(query)}'
        '&components=country:gh'
        '&location=5.6037,-0.1870'
        '&radius=50000'
        '&key=$apiKey',
      );

      final response = await http.get(uri).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 'OK' && data['predictions'] is List) {
          return (data['predictions'] as List)
              .map((p) => PlaceSuggestion.fromJson(p))
              .toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Get exact GPS Latitude and Longitude for a chosen Place ID
  static Future<PlaceCoordinates?> getPlaceCoordinates({
    required String placeId,
    required String apiKey,
  }) async {
    if (placeId.isEmpty || apiKey.isEmpty) return null;

    try {
      final uri = Uri.parse(
        'https://maps.googleapis.com/maps/api/place/details/json'
        '?place_id=${Uri.encodeComponent(placeId)}'
        '&fields=geometry,formatted_address'
        '&key=$apiKey',
      );

      final response = await http.get(uri).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 'OK' && data['result'] != null) {
          final result = data['result'];
          final location = result['geometry']?['location'];
          if (location != null) {
            return PlaceCoordinates(
              lat: (location['lat'] as num).toDouble(),
              lng: (location['lng'] as num).toDouble(),
              address: result['formatted_address'] ?? '',
            );
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

