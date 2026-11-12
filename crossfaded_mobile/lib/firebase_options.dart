// File generated for CrossFaded Mobile
// Matches the existing Firebase project: blessed-care-int

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return ios;
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyARuRLdEEcN4IgFGiTCfnwxNRiwrbohVXU',
    appId: '1:279408409414:web:656fc3c5a51b5530c38347',
    messagingSenderId: '279408409414',
    projectId: 'blessed-care-int',
    authDomain: 'blessed-care-int.firebaseapp.com',
    storageBucket: 'blessed-care-int.appspot.com',
    measurementId: 'G-PQ11SQWHGZ',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyARuRLdEEcN4IgFGiTCfnwxNRiwrbohVXU',
    appId: '1:279408409414:android:656fc3c5a51b5530c38347',
    messagingSenderId: '279408409414',
    projectId: 'blessed-care-int',
    storageBucket: 'blessed-care-int.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyARuRLdEEcN4IgFGiTCfnwxNRiwrbohVXU',
    appId: '1:279408409414:ios:656fc3c5a51b5530c38347',
    messagingSenderId: '279408409414',
    projectId: 'blessed-care-int',
    storageBucket: 'blessed-care-int.appspot.com',
    iosBundleId: 'com.crossfaded.store.crossfadedMobile',
  );
}

