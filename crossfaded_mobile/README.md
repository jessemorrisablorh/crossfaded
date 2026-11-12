# CrossFaded Mobile App (Android & iOS)

A production-ready Flutter application for **CrossFaded** — built with the exact Black & Gold luxury styling, Firebase Firestore synchronization, dynamic delivery pricing engine, Google Places address autocomplete, and Cash on Delivery checkout system matching the website.

---

## Architecture & Structure

```
crossfaded_mobile/
├── android/                   # Native Android wrapper (permissions, app name, package: com.crossfaded.store)
├── ios/                       # Native iOS wrapper (location permissions, URL schemes)
├── assets/images/             # Brand logos, cigar visuals, and product placeholders
├── lib/
│   ├── firebase_options.dart  # Multi-platform Firebase configuration (blessed-care-int)
│   ├── main.dart              # MultiProvider bootstrap, dark theme, and orientation lock
│   ├── theme/
│   │   └── app_theme.dart     # Black (#000000) and Gold (#FBBF24) luxury theme
│   ├── models/
│   │   ├── product.dart       # Catalog hardware, cigars, specs, and stock
│   │   ├── category.dart      # Curated collections
│   │   ├── cart_item.dart     # Shopping bag model
│   │   ├── order.dart         # Orders (#CF-XXXXXX) with 4-step dispatch status
│   │   ├── delivery_settings.dart # Real-time start fare, km/min rates, dispatch %
│   │   └── user_profile.dart  # User profile with default GPS and address
│   ├── services/
│   │   ├── firebase_service.dart     # Live Firestore streams (products, orders, settings)
│   │   ├── auth_service.dart         # Email/Password + Anonymous Guest sign-in
│   │   ├── places_service.dart       # Google Places Autocomplete API
│   │   └── delivery_calculator.dart  # Real-world Accra road distance & fare formula
│   ├── providers/
│   │   ├── auth_provider.dart        # Authentication state
│   │   ├── product_provider.dart     # Live catalog, search, and category filter
│   │   ├── cart_provider.dart        # Persistent local shopping bag
│   │   └── delivery_provider.dart    # Live GPS, Google Places suggestions & fare
│   ├── screens/
│   │   ├── splash_screen.dart        # Animated luxury splash screen
│   │   ├── main_nav_screen.dart      # 5-Tab bottom navigation
│   │   ├── home_screen.dart          # Hero slider, categories, and bestsellers
│   │   ├── shop_screen.dart          # 2-column catalog, search, and sort
│   │   ├── product_detail_screen.dart # Image carousel, specs, and Add-to-Bag
│   │   ├── cart_screen.dart          # Shopping bag & checkout navigation
│   │   ├── checkout_screen.dart      # Customer details, Google Places, COD
│   │   ├── order_success_screen.dart # #CF-XXXXXX ID, 1-tap copy & WhatsApp dispatch
│   │   ├── track_order_screen.dart   # Live 4-step courier dispatch timeline
│   │   ├── orders_history_screen.dart# User order history
│   │   ├── auth_screen.dart          # Sign In / Register / Guest
│   │   └── account_screen.dart       # Profile, WhatsApp concierge & settings
│   └── widgets/
│       ├── product_card.dart         # 2-column responsive product card
│       ├── address_search_field.dart # Google Places autocomplete with GPS capture
│       └── order_status_badge.dart   # Live status pill (Pending, Shipped, etc.)
```

---

## How to Debug on a Real Device (Without Affecting the Website)

The mobile app and the website are completely independent:
* Website: Run `npm run dev` in the root folder (`http://localhost:3000`).
* Mobile App: Run in a separate terminal:

### 1. Debugging on an Android Device
1. Connect your Android phone via USB.
2. Enable **Developer Options** and **USB Debugging** on your phone.
3. Verify connection:
   ```bash
   flutter devices
   ```
4. Run the app:
   ```bash
   cd crossfaded_mobile
   flutter run
   ```

### 2. Debugging on an iPhone / iOS Simulator
* **Simulator**:
  ```bash
  cd crossfaded_mobile
  open -a Simulator
  flutter run
  ```
* **Real iPhone**:
  1. Open the iOS project in Xcode:
     ```bash
     open crossfaded_mobile/ios/Runner.xcworkspace
     ```
  2. Under **Signing & Capabilities**, select your Apple Developer Team.
  3. Connect your iPhone via USB and trust your Mac.
  4. Run `flutter run -d <your-iphone-id>`.

---

## Production Builds

### Android Release APK:
```bash
cd crossfaded_mobile
flutter build apk --release
```
*Output: `crossfaded_mobile/build/app/outputs/flutter-apk/app-release.apk`*

### Android App Bundle (Google Play Store):
```bash
cd crossfaded_mobile
flutter build appbundle --release
```

### iOS Release:
```bash
cd crossfaded_mobile
flutter build ipa --release
```
