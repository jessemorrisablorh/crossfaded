import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class AdminProfileDialog extends StatefulWidget {
  const AdminProfileDialog({Key? key}) : super(key: key);

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (_) => const AdminProfileDialog(),
    );
  }

  @override
  State<AdminProfileDialog> createState() => _AdminProfileDialogState();
}

class _AdminProfileDialogState extends State<AdminProfileDialog> {
  final _nameFormKey = GlobalKey<FormState>();
  final _passFormKey = GlobalKey<FormState>();

  late TextEditingController _firstnameCtrl;
  late TextEditingController _lastnameCtrl;
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  bool _obscurePass = true;
  bool _isSavingName = false;
  bool _isSavingPass = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<AuthProvider>().profile;
    _firstnameCtrl = TextEditingController(text: profile?.firstname ?? '');
    _lastnameCtrl = TextEditingController(text: profile?.lastname ?? '');
  }

  @override
  void dispose() {
    _firstnameCtrl.dispose();
    _lastnameCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _updateName() async {
    if (!_nameFormKey.currentState!.validate()) return;
    setState(() => _isSavingName = true);

    final auth = context.read<AuthProvider>();
    final success = await auth.updateAdminAccountDetails(
      firstname: _firstnameCtrl.text.trim(),
      lastname: _lastnameCtrl.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isSavingName = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppTheme.emeraldBg,
          content: Text('Admin name updated successfully!'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.errorRed,
          content: Text(auth.errorMessage ?? 'Failed to update name'),
        ),
      );
    }
  }

  Future<void> _changePassword() async {
    if (!_passFormKey.currentState!.validate()) return;

    if (_newPassCtrl.text != _confirmPassCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppTheme.errorRed,
          content: Text('Passwords do not match.'),
        ),
      );
      return;
    }

    setState(() => _isSavingPass = true);

    final auth = context.read<AuthProvider>();
    final success = await auth.changePassword(_newPassCtrl.text.trim());

    if (!mounted) return;
    setState(() => _isSavingPass = false);

    if (success) {
      _newPassCtrl.clear();
      _confirmPassCtrl.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: AppTheme.emeraldBg,
          content: Text('Admin password changed successfully!'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.errorRed,
          content: Text(auth.errorMessage ?? 'Failed to change password. You may need to re-login.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<AuthProvider>().profile;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: const Color(0xFF141414),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.border),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.manage_accounts_outlined, color: AppTheme.primaryAmber, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        'ADMIN SECURITY & PROFILE',
                        style: GoogleFonts.anton(
                          fontSize: 18,
                          color: AppTheme.primaryAmber,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textMuted, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Email info badge
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield, color: AppTheme.primaryAmber, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Authenticated Admin Email',
                            style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted),
                          ),
                          Text(
                            profile?.email ?? 'admin@crossfadedgh.com',
                            style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Section 1: Change Name
              Text(
                'UPDATE ADMIN NAME',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: AppTheme.primaryAmber,
                ),
              ),
              const SizedBox(height: 8),
              Form(
                key: _nameFormKey,
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _firstnameCtrl,
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            decoration: InputDecoration(
                              labelText: 'First Name',
                              filled: true,
                              fillColor: AppTheme.card,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            controller: _lastnameCtrl,
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            decoration: InputDecoration(
                              labelText: 'Last Name',
                              filled: true,
                              fillColor: AppTheme.card,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: _isSavingName ? null : _updateName,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.primaryAmber,
                          side: const BorderSide(color: AppTheme.primaryAmber),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isSavingName
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(color: AppTheme.primaryAmber, strokeWidth: 2),
                              )
                            : const Text('SAVE NAME', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(color: AppTheme.border, height: 32),

              // Section 2: Change Password
              Text(
                'CHANGE PASSWORD',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: AppTheme.primaryAmber,
                ),
              ),
              const SizedBox(height: 8),
              Form(
                key: _passFormKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _newPassCtrl,
                      obscureText: _obscurePass,
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                      validator: (v) => v == null || v.length < 6 ? 'Min 6 characters' : null,
                      decoration: InputDecoration(
                        labelText: 'New Password',
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePass ? Icons.visibility_off : Icons.visibility, size: 18),
                          onPressed: () => setState(() => _obscurePass = !_obscurePass),
                        ),
                        filled: true,
                        fillColor: AppTheme.card,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _confirmPassCtrl,
                      obscureText: _obscurePass,
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                      validator: (v) => v == null || v.isEmpty ? 'Confirm password' : null,
                      decoration: InputDecoration(
                        labelText: 'Confirm New Password',
                        filled: true,
                        fillColor: AppTheme.card,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSavingPass ? null : _changePassword,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryAmber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isSavingPass
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                              )
                            : const Text('UPDATE PASSWORD', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

