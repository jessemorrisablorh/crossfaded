import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Sign in with email and password
  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    return await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
  }

  // Register with email, password, and profile fields
  Future<UserCredential> registerWithEmail({
    required String email,
    required String password,
    required String firstname,
    required String lastname,
    required String phone,
    String? address,
    double? lat,
    double? lng,
  }) async {
    final cred = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );

    if (cred.user != null) {
      await _db.collection('users').doc(cred.user!.uid).set({
        'uid': cred.user!.uid,
        'email': email.trim(),
        'firstname': firstname.trim(),
        'lastname': lastname.trim(),
        'phone': phone.trim(),
        'address': address ?? '',
        'lat': lat,
        'lng': lng,
        'role': 'user',
        'createdAt': FieldValue.serverTimestamp(),
      });
    }

    return cred;
  }

  // Guest Anonymous Sign In
  Future<UserCredential> signInAnonymously() async {
    return await _auth.signInAnonymously();
  }

  // Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // Reset password
  Future<void> resetPassword(String email) async {
    await _auth.sendPasswordResetEmail(email: email.trim());
  }

  // Update Password
  Future<void> updatePassword(String newPassword) async {
    final user = _auth.currentUser;
    if (user != null) {
      await user.updatePassword(newPassword.trim());
    }
  }

  // Update Name
  Future<void> updateName({required String firstname, required String lastname}) async {
    final user = _auth.currentUser;
    if (user != null) {
      final displayName = '$firstname $lastname'.trim();
      try {
        await user.updateDisplayName(displayName);
      } catch (_) {}
      await _db.collection('users').doc(user.uid).set({
        'firstname': firstname.trim(),
        'lastname': lastname.trim(),
      }, SetOptions(merge: true));
    }
  }

  // Check if UID / email has administrative privileges
  Future<bool> checkIsAdmin(String uid, [String? email]) async {
    if (email != null && email.toLowerCase().contains('admin')) {
      return true;
    }
    try {
      final adminSnap = await _db.collection('admins').doc(uid).get();
      if (adminSnap.exists) return true;

      final userSnap = await _db.collection('users').doc(uid).get();
      if (userSnap.exists && userSnap.data()?['role'] == 'admin') {
        return true;
      }
      return false;
    } catch (_) {
      return email != null && email.toLowerCase().contains('admin');
    }
  }
}

