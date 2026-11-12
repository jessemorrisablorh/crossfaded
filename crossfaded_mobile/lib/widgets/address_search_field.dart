import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/delivery_provider.dart';
import '../services/places_service.dart';
import '../theme/app_theme.dart';

class AddressSearchField extends StatefulWidget {
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;

  const AddressSearchField({
    Key? key,
    required this.controller,
    this.onChanged,
  }) : super(key: key);

  @override
  State<AddressSearchField> createState() => _AddressSearchFieldState();
}

class _AddressSearchFieldState extends State<AddressSearchField> {
  List<PlaceSuggestion> _suggestions = [];
  bool _isSearching = false;

  void _onQueryChanged(String query) async {
    if (widget.onChanged != null) widget.onChanged!(query);

    if (query.trim().length < 2) {
      if (mounted) setState(() => _suggestions = []);
      return;
    }

    setState(() => _isSearching = true);
    final delivery = context.read<DeliveryProvider>();
    final results = await delivery.searchPlaces(query);

    if (mounted) {
      setState(() {
        _suggestions = results;
        _isSearching = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final delivery = context.watch<DeliveryProvider>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label & GPS Locator Button
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'DELIVERY ADDRESS *',
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: AppTheme.textSecondary,
              ),
            ),
            InkWell(
              onTap: delivery.isLocating
                  ? null
                  : () async {
                      final success = await context
                          .read<DeliveryProvider>()
                          .captureCurrentLocation();
                      if (success) {
                        widget.controller.text =
                            context.read<DeliveryProvider>().address;
                        setState(() => _suggestions = []);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: Color(0xFF1F1F1F),
                              content: Text(
                                'GPS coordinates captured successfully!',
                                style: TextStyle(color: AppTheme.primaryAmber),
                              ),
                            ),
                          );
                        }
                      } else {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              backgroundColor: Color(0xFF1F1F1F),
                              content: Text(
                                'Unable to acquire GPS. Please allow location permissions.',
                                style: TextStyle(color: Colors.redAccent),
                              ),
                            ),
                          );
                        }
                      }
                    },
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                child: Row(
                  children: [
                    if (delivery.isLocating)
                      const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppTheme.primaryAmber,
                        ),
                      )
                    else
                      const Icon(Icons.my_location,
                          size: 13, color: AppTheme.primaryAmber),
                    const SizedBox(width: 4),
                    Text(
                      'Use My GPS',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryAmber,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        // Search Input
        TextField(
          controller: widget.controller,
          onChanged: _onQueryChanged,
          style: GoogleFonts.poppins(fontSize: 13, color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Search address or landmark in Accra...',
            prefixIcon: const Icon(Icons.location_on_outlined,
                color: AppTheme.primaryAmber, size: 20),
            suffixIcon: _isSearching
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppTheme.primaryAmber,
                      ),
                    ),
                  )
                : widget.controller.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear,
                            size: 16, color: AppTheme.textMuted),
                        onPressed: () {
                          widget.controller.clear();
                          setState(() => _suggestions = []);
                        },
                      )
                    : null,
          ),
        ),

        // Google Places Suggestions List
        if (_suggestions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 4),
            decoration: BoxDecoration(
              color: AppTheme.cardElevated,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.6),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _suggestions.length > 5 ? 5 : _suggestions.length,
              separatorBuilder: (_, __) =>
                  const Divider(color: AppTheme.border, height: 1),
              itemBuilder: (ctx, i) {
                final place = _suggestions[i];
                return ListTile(
                  dense: true,
                  leading: const Icon(Icons.place,
                      size: 18, color: AppTheme.primaryAmber),
                  title: Text(
                    place.mainText,
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  subtitle: Text(
                    place.secondaryText,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  onTap: () async {
                    widget.controller.text = place.description;
                    setState(() => _suggestions = []);
                    FocusScope.of(context).unfocus();
                    await context.read<DeliveryProvider>().selectPlace(place);
                  },
                );
              },
            ),
          ),
      ],
    );
  }
}

