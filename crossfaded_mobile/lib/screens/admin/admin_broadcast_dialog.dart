import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/firebase_service.dart';
import '../../theme/app_theme.dart';

class AdminBroadcastDialog extends StatefulWidget {
  const AdminBroadcastDialog({Key? key}) : super(key: key);

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (_) => const AdminBroadcastDialog(),
    );
  }

  @override
  State<AdminBroadcastDialog> createState() => _AdminBroadcastDialogState();
}

class _AdminBroadcastDialogState extends State<AdminBroadcastDialog> {
  final _formKey = GlobalKey<FormState>();
  final FirebaseService _firebaseService = FirebaseService();

  final _titleCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  String _target = 'all';
  bool _isSending = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSending = true);

    try {
      await _firebaseService.sendBroadcastNotification(
        title: _titleCtrl.text.trim(),
        message: _messageCtrl.text.trim(),
        target: _target,
      );

      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.emeraldBg,
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: AppTheme.primaryAmber, size: 18),
              const SizedBox(width: 8),
              const Expanded(
                child: Text('Push notification broadcast sent to all users!'),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      setState(() => _isSending = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppTheme.errorRed, content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: const Color(0xFF141414),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.primaryAmber, width: 1.5),
        ),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryAmber.withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.campaign, color: AppTheme.primaryAmber, size: 22),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PUSH NOTIFICATION',
                            style: GoogleFonts.anton(
                              fontSize: 18,
                              color: AppTheme.primaryAmber,
                              letterSpacing: 1.2,
                            ),
                          ),
                          Text(
                            'Broadcast live announcement to all active users',
                            style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Title
                TextFormField(
                  controller: _titleCtrl,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                  validator: (val) => val == null || val.isEmpty ? 'Title required' : null,
                  decoration: InputDecoration(
                    labelText: 'Notification Headline *',
                    hintText: 'e.g. Flash Drop: Gold Crushers Back in Stock!',
                    filled: true,
                    fillColor: AppTheme.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),

                // Message
                TextFormField(
                  controller: _messageCtrl,
                  maxLines: 3,
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                  validator: (val) => val == null || val.isEmpty ? 'Message required' : null,
                  decoration: InputDecoration(
                    labelText: 'Broadcast Message *',
                    hintText: 'e.g. Same-day delivery across Accra with Cash on Delivery. Order yours now.',
                    filled: true,
                    fillColor: AppTheme.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),

                // Target Dropdown
                DropdownButtonFormField<String>(
                  value: _target,
                  dropdownColor: const Color(0xFF1A1A1A),
                  style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Target Audience',
                    filled: true,
                    fillColor: AppTheme.card,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All Storefront Users & Buyers')),
                    DropdownMenuItem(value: 'accra', child: Text('Accra Local Customers')),
                    DropdownMenuItem(value: 'subscribers', child: Text('Loyalty Club Members')),
                  ],
                  onChanged: (val) => setState(() => _target = val ?? 'all'),
                ),
                const SizedBox(height: 20),

                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: AppTheme.border),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('CANCEL'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isSending ? null : _send,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryAmber,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isSending
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                              )
                            : Text(
                                'BROADCAST',
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.8,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

