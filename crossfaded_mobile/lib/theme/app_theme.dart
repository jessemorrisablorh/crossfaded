import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Color Palette
  static const Color primaryAmber = Color(0xFFFBBF24); // Amber 400
  static const Color primaryAmberDark = Color(0xFFD97706); // Amber 600
  static const Color background = Color(0xFF000000);
  static const Color surface = Color(0xFF0F0F0F);
  static const Color card = Color(0xFF171717);
  static const Color cardElevated = Color(0xFF1F1F1F);
  static const Color border = Color(0xFF27272A); // Zinc 800
  static const Color borderSubtle = Color(0xFF1E1E22);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA1A1AA); // Zinc 400
  static const Color textMuted = Color(0xFF71717A); // Zinc 500

  static const Color emerald = Color(0xFF10B981);
  static const Color emeraldBg = Color(0xFF064E3B);
  static const Color errorRed = Color(0xFFEF4444);
  static const Color danger = Color(0xFFEF4444);

  // Theme Data
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primaryAmber,
      colorScheme: const ColorScheme.dark(
        primary: primaryAmber,
        secondary: primaryAmber,
        surface: surface,
        error: errorRed,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.anton(
          color: primaryAmber,
          fontSize: 22,
          letterSpacing: 1.5,
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: const Color(0xFF0A0A0A),
        selectedItemColor: primaryAmber,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 12,
        selectedLabelStyle: GoogleFonts.poppins(
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
        unselectedLabelStyle: GoogleFonts.poppins(
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.black,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.poppins(color: textMuted, fontSize: 13),
        labelStyle: GoogleFonts.poppins(color: textSecondary, fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryAmber, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryAmber,
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
          ),
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.anton(fontSize: 32, color: textPrimary),
        displayMedium: GoogleFonts.anton(fontSize: 24, color: textPrimary),
        titleLarge: GoogleFonts.raleway(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary),
        titleMedium: GoogleFonts.raleway(fontSize: 15, fontWeight: FontWeight.w600, color: textPrimary),
        bodyLarge: GoogleFonts.poppins(fontSize: 14, color: textPrimary),
        bodyMedium: GoogleFonts.poppins(fontSize: 12, color: textSecondary),
        labelLarge: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black),
      ),
    );
  }
}
