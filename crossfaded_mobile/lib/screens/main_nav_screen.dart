import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../services/order_notification_service.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'shop_screen.dart';
import 'track_order_screen.dart';
import 'cart_screen.dart';
import 'account_screen.dart';

class MainNavScreen extends StatefulWidget {
  final int initialIndex;

  const MainNavScreen({Key? key, this.initialIndex = 0}) : super(key: key);

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    HomeScreen(),
    ShopScreen(),
    TrackOrderScreen(),
    CartScreen(),
    AccountScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    final cartCount = context.watch<CartProvider>().totalCount;
    final isAdmin = context.watch<AuthProvider>().isAdmin;

    // Start admin order ring alerts when signed in as admin
    if (isAdmin) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        OrderNotificationService().startAdminListening();
      });
    }

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0A0A0A),
          border: Border(top: BorderSide(color: AppTheme.border, width: 0.8)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          selectedLabelStyle: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
          unselectedLabelStyle: GoogleFonts.poppins(
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
          selectedItemColor: AppTheme.primaryAmber,
          unselectedItemColor: AppTheme.textMuted,
          backgroundColor: const Color(0xFF0A0A0A),
          type: BottomNavigationBarType.fixed,
          items: [
            const BottomNavigationBarItem(
              icon: ImageIcon(AssetImage(("images/home.png"))),
              activeIcon: ImageIcon(
                AssetImage("images/home.png"),
                color: AppTheme.primaryAmber,
              ),
              label: 'Home',
            ),
            const BottomNavigationBarItem(
              icon: ImageIcon(AssetImage(("images/layout.png"))),
              activeIcon: ImageIcon(
                AssetImage("images/layout.png"),
                color: AppTheme.primaryAmber,
              ),
              label: 'Shop',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.local_shipping_outlined),
              activeIcon: Icon(
                Icons.local_shipping,
                color: AppTheme.primaryAmber,
              ),
              label: 'Track',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: cartCount > 0,
                backgroundColor: AppTheme.primaryAmber,
                textColor: Colors.black,
                label: Text(
                  cartCount.toString(),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
                child: const ImageIcon(AssetImage(("images/cart.png"))),
              ),
              activeIcon: Badge(
                isLabelVisible: cartCount > 0,
                backgroundColor: AppTheme.primaryAmber,
                textColor: Colors.black,
                label: Text(
                  cartCount.toString(),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
                child: const ImageIcon(
                  AssetImage("images/cart.png"),
                  color: AppTheme.primaryAmber,
                ),
              ),
              label: 'Bag',
            ),
            BottomNavigationBarItem(
              icon: ImageIcon(AssetImage(("images/account.png"))),
              activeIcon: ImageIcon(
                AssetImage("images/account.png"),
                color: AppTheme.primaryAmber,
              ),
              label: 'Account',
            ),
          ],
        ),
      ),
    );
  }
}
