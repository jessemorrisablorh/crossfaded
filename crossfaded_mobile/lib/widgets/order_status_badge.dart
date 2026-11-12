import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class OrderStatusBadge extends StatelessWidget {
  final String status;

  const OrderStatusBadge({Key? key, required this.status}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color border;
    String label;

    switch (status.toLowerCase()) {
      case 'delivered':
        bg = const Color(0xFF064E3B);
        text = const Color(0xFF34D399);
        border = const Color(0xFF059669);
        label = 'DELIVERED';
        break;
      case 'shipped':
        bg = const Color(0xFF1E3A8A);
        text = const Color(0xFF60A5FA);
        border = const Color(0xFF2563EB);
        label = 'OUT FOR DELIVERY';
        break;
      case 'processing':
        bg = const Color(0xFF78350F);
        text = const Color(0xFFFBBF24);
        border = const Color(0xFFB45309);
        label = 'PACKAGING';
        break;
      case 'cancelled':
        bg = const Color(0xFF450A0A);
        text = const Color(0xFFF87171);
        border = const Color(0xFFDC2626);
        label = 'CANCELLED';
        break;
      case 'pending':
      default:
        bg = const Color(0xFF27272A);
        text = const Color(0xFFFBBF24);
        border = const Color(0xFF3F3F46);
        label = 'PENDING DISPATCH';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: bg.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border.withOpacity(0.5), width: 1),
      ),
      child: Text(
        label,
        style: GoogleFonts.poppins(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.6,
          color: text,
        ),
      ),
    );
  }
}
