import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_profile.dart';
import '../services/auth_service.dart';
import '../services/firebase_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final FirebaseService _firebaseService = FirebaseService();

  User? _user;
  UserProfile? _profile;
  bool _isLoading = true;
  bool _isAdmin = false;
  String? _errorMessage;

  User? get user => _user;
  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;
  bool get isAdmin => _isAdmin;
  bool get isAuthenticated => _user != null && !_user!.isAnonymous;
  bool get isGuest => _user != null && _user!.isAnonymous;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _init();
  }

  void _init() {
    _authService.authStateChanges.listen((u) async {
      _user = u;
      if (u != null && !u.isAnonymous) {
        _profile = await _firebaseService.getUserProfile(u.uid);
        _isAdmin = await _authService.checkIsAdmin(u.uid, u.email);
      } else {
        _profile = null;
        _isAdmin = false;
      }
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<bool> signIn(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.signInWithEmail(email: email, password: password);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanAuthError(e.toString());
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstname,
    required String lastname,
    required String phone,
    String? address,
    double? lat,
    double? lng,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.registerWithEmail(
        email: email,
        password: password,
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        address: address,
        lat: lat,
        lng: lng,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanAuthError(e.toString());
      notifyListeners();
      return false;
    }
  }

  Future<bool> continueAsGuest() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.signInAnonymously();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanAuthError(e.toString());
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    await _authService.signOut();
    _user = null;
    _profile = null;
    _isAdmin = false;
    notifyListeners();
  }

  Future<bool> signInAsAdmin(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final cred = await _authService.signInWithEmail(email: email, password: password);
      if (cred.user != null) {
        _isAdmin = await _authService.checkIsAdmin(cred.user!.uid, cred.user!.email);
        if (!_isAdmin) {
          _errorMessage = 'This account does not have administrative privileges.';
          _isLoading = false;
          notifyListeners();
          return false;
        }
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanAuthError(e.toString());
      notifyListeners();
      return false;
    }
  }

  void setAdminMode(bool enabled) {
    _isAdmin = enabled;
    notifyListeners();
  }

  Future<bool> updateAdminAccountDetails({
    required String firstname,
    required String lastname,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      await _authService.updateName(firstname: firstname, lastname: lastname);
      if (_user != null) {
        _profile = await _firebaseService.getUserProfile(_user!.uid);
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> changePassword(String newPassword) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      await _authService.updatePassword(newPassword);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = _cleanAuthError(e.toString());
      notifyListeners();
      return false;
    }
  }

  Future<void> updateDeliveryDetails({
    required String address,
    String? placename,
    double? lat,
    double? lng,
    String? phone,
  }) async {
    if (_user == null || _user!.isAnonymous) return;

    final data = <String, dynamic>{
      'address': address,
      if (placename != null) 'placename': placename,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
    };

    await _firebaseService.updateUserProfile(_user!.uid, data);
    _profile = await _firebaseService.getUserProfile(_user!.uid);
    notifyListeners();
  }

  String _cleanAuthError(String error) {
    if (error.contains('user-not-found')) return 'No account found with this email.';
    if (error.contains('wrong-password') || error.contains('invalid-credential')) {
      return 'Incorrect email or password. Please verify your credentials.';
    }
    if (error.contains('email-already-in-use')) return 'An account already exists with this email.';
    if (error.contains('weak-password')) return 'Password should be at least 6 characters.';
    if (error.contains('invalid-email')) return 'Please enter a valid email address.';
    return 'Authentication error. Please check your network and credentials.';
  }
}

