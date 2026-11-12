import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import 'auth_screen.dart';
import 'orders_history_screen.dart';
import 'track_order_screen.dart';
import 'admin/admin_dashboard_screen.dart';
import '../widgets/admin_login_sheet.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({Key? key}) : super(key: key);

  void _openWhatsApp() async {
    const text = 'Hello CrossFaded GH, I would like customer assistance with my account or order.';
    final uri = Uri.parse('https://wa.me/233543236328?text=${Uri.encodeComponent(text)}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isAuthenticated = auth.isAuthenticated;
    final profile = auth.profile;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'ACCOUNT & SUPPORT',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            // Admin Active Banner
            if (auth.isAdmin)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF16140A),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primaryAmber, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryAmber.withOpacity(0.15),
                      blurRadius: 16,
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryAmber.withOpacity(0.18),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield, color: AppTheme.primaryAmber, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ADMINISTRATOR ACTIVE',
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.0,
                              color: AppTheme.primaryAmber,
                            ),
                          ),
                          Text(
                            'Live order alarm & dispatch portal',
                            style: GoogleFonts.poppins(fontSize: 11, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryAmber,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        minimumSize: const Size(0, 36),
                      ),
                      child: const Text('OPEN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ],
                ),
              ),

            // User Card or Sign In Banner
            if (isAuthenticated && profile != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryAmber.withOpacity(0.15),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.primaryAmber, width: 1.5),
                      ),
                      child: Center(
                        child: Text(
                          profile.displayName.isNotEmpty
                              ? profile.displayName[0].toUpperCase()
                              : 'U',
                          style: GoogleFonts.anton(fontSize: 22, color: AppTheme.primaryAmber),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile.displayName,
                            style: GoogleFonts.raleway(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            profile.email,
                            style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted),
                          ),
                          if (profile.phone.isNotEmpty)
                            Text(
                              profile.phone,
                              style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primaryAmber.withOpacity(0.5)),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryAmber.withOpacity(0.08),
                      blurRadius: 15,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Icon(Icons.person_outline, size: 40, color: AppTheme.primaryAmber),
                    const SizedBox(height: 10),
                    Text(
                      'CrossFaded Syndicate Account',
                      style: GoogleFonts.raleway(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Sign in to access saved Accra delivery destinations and order dispatch history.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AuthScreen()),
                          );
                        },
                        child: const Text('SIGN IN OR REGISTER'),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 20),

            // Navigation Menu Options
            Container(
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _menuTile(
                    icon: Icons.history,
                    title: 'My Orders History',
                    subtitle: 'Review past dispatches and receipts',
                    onTap: () {
                      if (isAuthenticated) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const OrdersHistoryScreen()),
                        );
                      } else {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AuthScreen()),
                        );
                      }
                    },
                  ),
                  const Divider(color: AppTheme.border, height: 1),
                  _menuTile(
                    icon: Icons.local_shipping_outlined,
                    title: 'Track Dispatch by Order ID',
                    subtitle: 'Real-time rider and courier lookup',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const TrackOrderScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppTheme.border, height: 1),
                  _menuTile(
                    icon: Icons.chat_bubble_outline,
                    title: 'WhatsApp Concierge & Support',
                    subtitle: '+233 54 323 6328 • Accra, Ghana',
                    onTap: _openWhatsApp,
                  ),
                  const Divider(color: AppTheme.border, height: 1),
                  _menuTile(
                    icon: Icons.shield_outlined,
                    title: '18+ Adult Connoisseur Hardware',
                    subtitle: 'Strictly intended for legal age adults in Ghana',
                    onTap: () {},
                  ),
                  const Divider(color: AppTheme.border, height: 1),
                  _menuTile(
                    icon: Icons.admin_panel_settings_outlined,
                    title: 'Admin Fulfillment Dashboard',
                    subtitle: auth.isAdmin
                        ? 'Manage live orders & status updates'
                        : 'Store manager and administrator sign in',
                    onTap: () {
                      if (auth.isAdmin) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
                        );
                      } else {
                        AdminLoginSheet.show(context);
                      }
                    },
                  ),
                ],
              ),
            ),

            if (isAuthenticated) ...[
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () async {
                    await auth.signOut();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: Color(0xFF1F1F1F),
                          content: Text('Signed out successfully.', style: TextStyle(color: Colors.white)),
                        ),
                      );
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.redAccent,
                    side: const BorderSide(color: Color(0xFF7F1D1D)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.logout, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'SIGN OUT',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 30),

            Text(
              'CROSSFADED STORE GHANA • v1.0.0',
              style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted, letterSpacing: 1.0),
            ),
          ],
        ),
      ),
    );
  }

  Widget _menuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppTheme.primaryAmber, size: 20),
      ),
      title: Text(
        title,
        style: GoogleFonts.raleway(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
      ),
      trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 18),
      onTap: onTap,
    );
  }
}

