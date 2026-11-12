class UserProfile {
  final String uid;
  final String email;
  final String firstname;
  final String lastname;
  final String phone;
  final String address;
  final String? placename;
  final String city;
  final String region;
  final double? lat;
  final double? lng;
  final String role;
  final bool isBlocked;

  UserProfile({
    required this.uid,
    required this.email,
    this.firstname = '',
    this.lastname = '',
    this.phone = '',
    this.address = '',
    this.placename,
    this.city = 'Accra',
    this.region = 'Greater Accra',
    this.lat,
    this.lng,
    this.role = 'user',
    this.isBlocked = false,
  });

  String get displayName {
    final name = '$firstname $lastname'.trim();
    return name.isNotEmpty ? name : email.split('@').first;
  }

  factory UserProfile.fromMap(Map<String, dynamic> data, String uid) {
    return UserProfile(
      uid: uid,
      email: data['email'] ?? '',
      firstname: data['firstname'] ?? '',
      lastname: data['lastname'] ?? '',
      phone: data['phone'] ?? '',
      address: data['address'] ?? '',
      placename: data['placename'],
      city: data['city'] ?? 'Accra',
      region: data['region'] ?? 'Greater Accra',
      lat: (data['lat'] is num) ? (data['lat'] as num).toDouble() : null,
      lng: (data['lng'] is num) ? (data['lng'] as num).toDouble() : null,
      role: data['role'] ?? 'user',
      isBlocked: data['isBlocked'] == true || data['status'] == 'blocked',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'firstname': firstname,
      'lastname': lastname,
      'phone': phone,
      'address': address,
      'placename': placename,
      'city': city,
      'region': region,
      'lat': lat,
      'lng': lng,
      'role': role,
      'isBlocked': isBlocked,
      'status': isBlocked ? 'blocked' : 'active',
    };
  }
}

