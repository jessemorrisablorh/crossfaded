import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, CheckCircle2, Navigation, X, Loader2 } from 'lucide-react';
import {
  PlaceSuggestion,
  searchPlacesSuggestions,
  resolvePlaceCoordinates,
  loadGooglePlacesScript,
} from '../../services/deliveryService';
import { firestoreService, DEFAULT_DELIVERY_SETTINGS } from '../../services/firestoreService';
import { DeliverySettings } from '../../types';

export interface SelectedPlaceData {
  placename: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: SelectedPlaceData) => void;
  selectedCoords?: { lat?: number; lng?: number; placename?: string };
  label?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  selectedCoords,
  label = 'Delivery Address',
  placeholder = 'Type street, neighborhood, or landmark...',
  required = true,
  helperText,
  className = '',
}) => {
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolved, setIsResolved] = useState(
    Boolean(selectedCoords?.lat && selectedCoords?.lng)
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Subscribe to global delivery settings for Google Places API Key
  useEffect(() => {
    const unsub = firestoreService.subscribeDeliverySettings((s) => {
      setSettings(s);
      if (s.googlePlacesApiKey && s.googlePlacesApiKey.trim()) {
        loadGooglePlacesScript(s.googlePlacesApiKey.trim()).catch(() => {});
      }
    });
    return () => unsub();
  }, []);

  // Synchronize internal query with incoming value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    setIsResolved(Boolean(selectedCoords?.lat && selectedCoords?.lng));
  }, [selectedCoords?.lat, selectedCoords?.lng]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsResolved(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesSuggestions(val, settings.googlePlacesApiKey);
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.warn('Place search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  // Handle selecting a suggested place
  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      const resolved = await resolvePlaceCoordinates(suggestion, settings.googlePlacesApiKey);
      setQuery(resolved.placename);
      onChange(resolved.placename);
      onPlaceSelect(resolved);
      setIsResolved(true);
    } catch (err) {
      console.warn('Error resolving place coordinates:', err);
      // Fallback
      const fallback = {
        placename: suggestion.description,
        lat: suggestion.lat || 5.6037,
        lng: suggestion.lng || -0.187,
      };
      setQuery(fallback.placename);
      onChange(fallback.placename);
      onPlaceSelect(fallback);
      setIsResolved(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-1 relative ${className}`} ref={containerRef}>
      {/* Label and GPS Lock Pill */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-300 font-poppins">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>

          {isResolved && selectedCoords?.lat && selectedCoords?.lng && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              GPS Locked ({selectedCoords.lat.toFixed(3)}, {selectedCoords.lng.toFixed(3)})
            </span>
          )}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <MapPin className="w-4 h-4 text-amber-400 absolute left-3.5 top-3 shrink-0 pointer-events-none" />

        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-black/70 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins transition-all"
          autoComplete="off"
        />

        <div className="absolute right-3 top-2.5 flex items-center gap-1 text-zinc-500">
          {isLoading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
          {!isLoading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onChange('');
                setSuggestions([]);
                setIsResolved(false);
              }}
              className="text-zinc-500 hover:text-white p-0.5 rounded"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {helperText && <p className="text-[11px] text-zinc-500 font-poppins">{helperText}</p>}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#212121] border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-zinc-800 animate-fade-in max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 bg-black/60 text-[10px] font-mono text-amber-400/90 uppercase tracking-wider flex items-center justify-between">
            <span>Tap to select location</span>
            <span>Suggested Locations</span>
          </div>

          {suggestions.map((item) => (
            <button
              key={item.placeId}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-4 py-2.5 text-left hover:bg-amber-400/10 transition-colors flex items-start gap-3 group"
            >
              <div className="p-1.5 rounded-lg bg-black border border-zinc-700 text-amber-400 group-hover:border-amber-400 shrink-0 mt-0.5 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate font-poppins">
                  {item.mainText}
                </p>
                <p className="text-[11px] text-zinc-400 truncate font-poppins mt-0.5">
                  {item.secondaryText}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

