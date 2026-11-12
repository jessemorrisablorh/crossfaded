import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final _loginEmailCtrl = TextEditingController();
  final _loginPassCtrl = TextEditingController();

  final _regFirstCtrl = TextEditingController();
  final _regLastCtrl = TextEditingController();
  final _regPhoneCtrl = TextEditingController();
  final _regEmailCtrl = TextEditingController();
  final _regPassCtrl = TextEditingController();

  bool _obscureLogin = true;
  bool _obscureReg = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailCtrl.dispose();
    _loginPassCtrl.dispose();
    _regFirstCtrl.dispose();
    _regLastCtrl.dispose();
    _regPhoneCtrl.dispose();
    _regEmailCtrl.dispose();
    _regPassCtrl.dispose();
    super.dispose();
  }

  void _login() async {
    final email = _loginEmailCtrl.text.trim();
    final pass = _loginPassCtrl.text.trim();

    if (email.isEmpty || pass.isEmpty) {
      _showSnack('Please enter both email and password.');
      return;
    }

    final success = await context.read<AuthProvider>().signIn(email, pass);
    if (success && mounted) {
      Navigator.pop(context);
    }
  }

  void _register() async {
    final email = _regEmailCtrl.text.trim();
    final pass = _regPassCtrl.text.trim();
    final first = _regFirstCtrl.text.trim();
    final last = _regLastCtrl.text.trim();
    final phone = _regPhoneCtrl.text.trim();

    if (email.isEmpty || pass.isEmpty || first.isEmpty) {
      _showSnack('Please fill in all required registration fields.');
      return;
    }

    final success = await context.read<AuthProvider>().register(
      email: email,
      password: pass,
      firstname: first,
      lastname: last,
      phone: phone,
    );

    if (success && mounted) {
      Navigator.pop(context);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF1F1F1F),
        content: Text(msg, style: const TextStyle(color: Colors.redAccent)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'ACCOUNT ACCESS',
          style: GoogleFonts.anton(
            fontSize: 22,
            color: AppTheme.primaryAmber,
            letterSpacing: 1.5,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Error banner if any
            if (auth.errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.redAccent, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        auth.errorMessage!,
                        style: GoogleFonts.poppins(color: Colors.redAccent, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),

            // Tab bar
            Container(
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.border),
              ),
              child: TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primaryAmber,
                labelColor: AppTheme.primaryAmber,
                unselectedLabelColor: AppTheme.textMuted,
                labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12),
                tabs: const [
                  Tab(text: 'SIGN IN'),
                  Tab(text: 'CREATE ACCOUNT'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Tab content
            SizedBox(
              height: 400,
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: Sign In
                  _buildSignInTab(auth),

                  // Tab 2: Register
                  _buildRegisterTab(auth),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // Guest option
            TextButton(
              onPressed: () async {
                final success = await context.read<AuthProvider>().continueAsGuest();
                if (success && mounted) {
                  Navigator.pop(context);
                }
              },
              child: Text(
                'CONTINUE AS GUEST',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary,
                  letterSpacing: 1.0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSignInTab(AuthProvider auth) {
    return Column(
      children: [
        TextField(
          controller: _loginEmailCtrl,
          keyboardType: TextInputType.emailAddress,
          style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
          decoration: const InputDecoration(
            labelText: 'Email Address',
            hintText: 'Enter your email',
            prefixIcon: Icon(Icons.mail_outline, size: 20, color: AppTheme.textMuted),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _loginPassCtrl,
          obscureText: _obscureLogin,
          style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Password',
            hintText: 'Enter your password',
            prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppTheme.textMuted),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureLogin ? Icons.visibility_off : Icons.visibility,
                size: 18,
                color: AppTheme.textMuted,
              ),
              onPressed: () => setState(() => _obscureLogin = !_obscureLogin),
            ),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: auth.isLoading ? null : _login,
            child: auth.isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                  )
                : const Text('SIGN IN'),
          ),
        ),
      ],
    );
  }

  Widget _buildRegisterTab(AuthProvider auth) {
    return SingleChildScrollView(
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _regFirstCtrl,
                  style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                  decoration: const InputDecoration(labelText: 'First Name *'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _regLastCtrl,
                  style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
                  decoration: const InputDecoration(labelText: 'Last Name'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _regPhoneCtrl,
            keyboardType: TextInputType.phone,
            style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Phone Number (Call on delivery)',
              hintText: 'e.g. 054 323 6328',
              prefixIcon: Icon(Icons.phone_outlined, size: 20, color: AppTheme.textMuted),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _regEmailCtrl,
            keyboardType: TextInputType.emailAddress,
            style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
            decoration: const InputDecoration(
              labelText: 'Email Address *',
              prefixIcon: Icon(Icons.mail_outline, size: 20, color: AppTheme.textMuted),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _regPassCtrl,
            obscureText: _obscureReg,
            style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              labelText: 'Password (min. 6 chars) *',
              prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppTheme.textMuted),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureReg ? Icons.visibility_off : Icons.visibility,
                  size: 18,
                  color: AppTheme.textMuted,
                ),
                onPressed: () => setState(() => _obscureReg = !_obscureReg),
              ),
            ),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: auth.isLoading ? null : _register,
              child: auth.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                    )
                  : const Text('CREATE ACCOUNT'),
            ),
          ),
        ],
      ),
    );
  }
}

