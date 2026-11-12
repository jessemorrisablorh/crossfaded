import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Key,
  Navigation,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Calculator,
  RefreshCw,
  LocateFixed,
  HelpCircle,
} from 'lucide-react';
import { firestoreService, DEFAULT_DELIVERY_SETTINGS } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { DeliverySettings } from '../../types';
import {
  calculateDistanceKm,
  calculateDeliveryFee,
  getDeliveryFareBreakdown,
  DeliveryFareBreakdown,
  searchPlacesSuggestions,
  getGooglePlacesDiagnostic,
} from '../../services/deliveryService';
import { AddressAutocomplete } from '../../components/ui/AddressAutocomplete';

export const AdminSettings: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [diagnosticMsg, setDiagnosticMsg] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Live Simulator state
  const [simLat, setSimLat] = useState<number>(5.556); // Osu Oxford St
  const [simLng, setSimLng] = useState<number>(-0.1824);
  const [simCartTotal, setSimCartTotal] = useState<number>(150);

  useEffect(() => {
    const unsub = firestoreService.subscribeDeliverySettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await firestoreService.updateDeliverySettings(settings);
      success('Delivery settings & Google Places API saved globally!');
    } catch (err) {
      console.error(err);
      toastError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch current admin GPS coordinates via browser Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toastError('Geolocation is not supported by your browser.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Math.round(pos.coords.latitude * 10000) / 10000;
        const newLng = Math.round(pos.coords.longitude * 10000) / 10000;
        setSettings((prev) => ({
          ...prev,
          pickupLat: newLat,
          pickupLng: newLng,
          pickupAddress:
            prev.pickupAddress ||
            `Store Location (${newLat}, ${newLng})`,
        }));
        setGettingLocation(false);
        success(`Captured current GPS: ${newLat}, ${newLng}`);
      },
      (err) => {
        setGettingLocation(false);
        toastError('Unable to retrieve location. Please check browser GPS permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Test the Google Places API key
  const handleTestApiKey = async () => {
    if (!settings.googlePlacesApiKey.trim()) {
      toastError('Please enter a Google Places API key to test.');
      return;
    }

    setTestingApi(true);
    setApiStatus('idle');
    setDiagnosticMsg(null);

    try {
      const results = await searchPlacesSuggestions('Accra Mall', settings.googlePlacesApiKey.trim());
      const diag = getGooglePlacesDiagnostic();
      const hasGoogle = results.some((r) => r.source === 'google');

      if (hasGoogle) {
        setApiStatus('success');
        setDiagnosticMsg('Google Places API (New) is active and returning real live places from Google Cloud servers!');
        success('Google Places API is active and connected!');
      } else {
        setApiStatus('error');
        if (diag.lastError) {
          setDiagnosticMsg(diag.lastError);
        } else if (diag.lastStatus === 'REQUEST_DENIED') {
          setDiagnosticMsg(
            'Google Cloud returned "REQUEST_DENIED": Please visit your Google Cloud Console (console.cloud.google.com) > APIs & Services, and make sure "Places API (New)" is enabled for this project, and that API key restrictions allow HTTP requests.'
          );
        } else {
          setDiagnosticMsg(
            'Google Places did not return results for this key. Please check your Google Cloud Console to ensure "Places API (New)" is enabled and billing is attached to your Google Cloud project.'
          );
        }
        toastError('Google Places API check failed. See details below.');
      }
    } catch (err: any) {
      setApiStatus('error');
      setDiagnosticMsg(String(err?.message || err));
      toastError('Failed to connect to Google Places API.');
    } finally {
      setTestingApi(false);
    }
  };

  // Distance for the simulator
  const simDistance = calculateDistanceKm(
    settings.pickupLat,
    settings.pickupLng,
    simLat,
    simLng
  );
  const simBreakdown = getDeliveryFareBreakdown(simDistance, settings, simCartTotal);
  const simFee = simBreakdown.finalFare;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-amber-400 font-mono text-sm">
        Loading Global Delivery Settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-amber-400" />
            <span>Google Places & Delivery Pricing Engine</span>
          </h1>
          <p className="font-poppins text-xs text-zinc-400 mt-1">
            Configure store GPS coordinates, Google Places API key, and distance calculation formulas saved globally in Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Globally...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================================= */}
        {/* 1. GOOGLE PLACES API KEY */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <h2 className="font-raleway text-base font-bold text-white">Google Places API Key</h2>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
              Autocomplete Provider
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-poppins">
            Used to suggest addresses in real-time as users type on the authentication and checkout pages, capturing exact GPS latitude and longitude.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.googlePlacesApiKey}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, googlePlacesApiKey: e.target.value }))
                }
                placeholder="AIzaSy..."
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white p-0.5 rounded"
                title={showApiKey ? 'Hide Key' : 'Show Key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestApiKey}
              disabled={testingApi || !settings.googlePlacesApiKey.trim()}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 text-white text-xs font-semibold rounded-xl font-poppins transition-colors flex items-center justify-center gap-1.5"
            >
              {testingApi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Testing Key...</span>
                </>
              ) : (
                <span>Test Connection</span>
              )}
            </button>
          </div>

          {apiStatus === 'success' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Google Places API is Connected & Active!</p>
                <p className="text-[11px] text-emerald-400/90 mt-0.5">Real-time address and landmark suggestions are streaming from Google servers.</p>
              </div>
            </div>
          )}

          {apiStatus === 'error' && (
            <div className="p-4 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>Google Places API Issue Detected</span>
              </div>
              <p className="text-zinc-300 leading-relaxed font-poppins">
                {diagnosticMsg || 'Google rejected the request. Please check that "Places API" is enabled on your Google Cloud Console.'}
              </p>
              <div className="p-3 rounded-lg bg-black/60 border border-zinc-800 text-[11px] text-zinc-400 font-poppins space-y-1">
                <p className="text-amber-300 font-semibold">How to activate on Google Cloud Console:</p>
                <p>1. Go to <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noreferrer" className="text-amber-400 underline">console.cloud.google.com/apis/library</a></p>
                <p>2. Search for <strong>Places API</strong> and click <strong>Enable</strong></p>
                <p>3. Also ensure <strong>Maps JavaScript API</strong> is enabled</p>
                <p>4. Under <strong>Credentials &gt; API Keys</strong>, ensure your key does not restrict HTTP referrers during development</p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. STORE PICKUP LOCATION (MY LOCATION) */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-400" />
              <h2 className="font-raleway text-base font-bold text-white">
                Store Pickup Location (Admin / Warehouse Origin)
              </h2>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation}
              className="px-3.5 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{gettingLocation ? 'Acquiring GPS...' : 'Use My Current Device GPS'}</span>
            </button>
          </div>

          <p className="text-xs text-zinc-400 font-poppins">
            Delivery distances are calculated from this exact GPS coordinate to the customer's dropoff location.
          </p>

          <div className="space-y-4">
            <AddressAutocomplete
              label="Store / Warehouse Location"
              value={settings.pickupAddress}
              onChange={(val) =>
                setSettings((prev) => ({ ...prev, pickupAddress: val }))
              }
              selectedCoords={{
                lat: settings.pickupLat,
                lng: settings.pickupLng,
                placename: settings.pickupAddress,
              }}
              onPlaceSelect={(place) => {
                setSettings((prev) => ({
                  ...prev,
                  pickupAddress: place.placename,
                  pickupLat: Math.round(place.lat * 10000) / 10000,
                  pickupLng: Math.round(place.lng * 10000) / 10000,
                }));
              }}
              placeholder="Search store location (e.g. East Legon, Accra Mall, Boundary Rd...)"
              helperText="Start typing to view Google Places suggestions. Tapping a place auto-fills the address and exact GPS coordinates below."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                  Pickup Latitude (GPS) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={settings.pickupLat}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, pickupLat: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="5.6425"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                  Pickup Longitude (GPS) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={settings.pickupLng}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, pickupLng: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="-0.1582"
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DYNAMIC DELIVERY FEE PRICING ENGINE (ALL FIGURES CONFIGURABLE) */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h2 className="font-raleway text-base font-bold text-white">
                Delivery Dispatch Pricing Engine
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto font-bold uppercase">
              Dynamic Distance Formula
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-poppins">
            Calculates motorbike delivery charges based on Start fare, distance per km, transit minutes per min, and dispatch booking fee percentage. All figures can be customized below and take effect globally.
          </p>

          {/* Active Formula Banner */}
          <div className="p-4 rounded-xl bg-black border border-amber-400/30 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                Delivery Fare Formula:
              </span>
              <span className="text-zinc-400 text-[10px]">
                Floor: Max(Fare, Min Price GH₵ {settings.minimumFee || 15})
              </span>
            </div>
            <p className="text-white">
              Subtotal = <strong className="text-amber-300">Start (GH₵ {settings.startFare ?? settings.baseFee ?? 3.15})</strong> + (Distance km × <strong className="text-amber-300">GH₵ {settings.ratePerKm ?? 1.45}</strong>) + (Est. Mins × <strong className="text-amber-300">GH₵ {settings.ratePerMin ?? 0.54}</strong>)
            </p>
            <p className="text-zinc-300 text-[11px]">
              Final Fare = Subtotal + (Subtotal × <strong className="text-amber-300">{settings.bookingFeePercent ?? 6.1}% Dispatch Fee</strong>)
            </p>
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Start Fare */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Start (Base Fare) *
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">GH₵</span>
              </div>
              <input
                type="number"
                step="0.05"
                min="0"
                required
                value={settings.startFare ?? settings.baseFee ?? 3.15}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSettings((prev) => ({ ...prev, startFare: val, baseFee: val }));
                }}
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">Default: GH₵ 3.15</span>
            </div>

            {/* Per KM Rate */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Per KM Rate *
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">GH₵ / KM</span>
              </div>
              <input
                type="number"
                step="0.05"
                min="0"
                required
                value={settings.ratePerKm ?? 1.45}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, ratePerKm: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">Default: GH₵ 1.45/KM</span>
            </div>

            {/* Per Min Rate */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Per Minute Rate *
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">GH₵ / MIN</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={settings.ratePerMin ?? 0.54}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, ratePerMin: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">Default: GH₵ 0.54/MIN</span>
            </div>

            {/* Dispatch Fee % */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Dispatch Fee (%) *
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={settings.bookingFeePercent ?? 6.1}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    bookingFeePercent: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">Default: 6.1%</span>
            </div>

            {/* Minimum Price */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Minimum Price (Floor) *
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">GH₵</span>
              </div>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={settings.minimumFee ?? 15.0}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, minimumFee: parseFloat(e.target.value) || 0 }))
                }
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">Default: GH₵ 15.00</span>
            </div>

            {/* Speed / Transit Minutes per KM */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Traffic Speed (Min / KM)
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">MIN / KM</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={settings.minutesPerKm ?? 2.0}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minutesPerKm: parseFloat(e.target.value) || 2.0,
                  }))
                }
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">Accra traffic: ~2.0 min/km</span>
            </div>

            {/* Free Delivery Threshold */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-1 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 font-poppins">
                  Free Delivery Cart Threshold (GHS)
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Free Over Threshold</span>
              </div>
              <input
                type="number"
                step="10"
                min="0"
                value={settings.freeDeliveryThreshold ?? 500}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-black border border-zinc-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-poppins block">
                Orders with cart subtotal ≥ this amount get free delivery (set 0 to disable free delivery).
              </span>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. LIVE DELIVERY FARE SIMULATOR */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-raleway text-base font-bold text-white">
              Live Delivery Fare Simulator
            </h2>
          </div>

          <p className="text-xs text-zinc-400 font-poppins">
            Simulate the exact delivery fare your customers will see on checkout. Choose a test destination or drag the distance slider to verify the calculation.
          </p>

          {/* Test Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSimLat(5.556);
                setSimLng(-0.1824);
              }}
              className="p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-amber-400 text-left transition-all"
            >
              <p className="text-xs font-bold text-white truncate">Osu Oxford Street</p>
              <p className="text-[10px] text-zinc-500 font-mono">Central Accra</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimLat(5.6378);
                setSimLng(-0.0984);
              }}
              className="p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-amber-400 text-left transition-all"
            >
              <p className="text-xs font-bold text-white truncate">Spintex Road</p>
              <p className="text-[10px] text-zinc-500 font-mono">Batsonaa Total</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimLat(5.6475);
                setSimLng(-0.0051);
              }}
              className="p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-amber-400 text-left transition-all"
            >
              <p className="text-xs font-bold text-white truncate">Tema Comm 1</p>
              <p className="text-[10px] text-zinc-500 font-mono">Harbour City</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimLat(5.5342);
                setSimLng(-0.4244);
              }}
              className="p-2.5 rounded-xl bg-black border border-zinc-800 hover:border-amber-400 text-left transition-all"
            >
              <p className="text-xs font-bold text-white truncate">Kasoa Barrier</p>
              <p className="text-[10px] text-zinc-500 font-mono">Central Region</p>
            </button>
          </div>

          {/* The Delivery Fare Card */}
          <div className="p-3.5 sm:p-7 rounded-xl sm:rounded-2xl bg-black border border-zinc-700/80 shadow-2xl space-y-4 max-w-xl mx-auto">
            
            {/* Header: Motorbike Dispatch */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl font-bold">
                  🏍️
                </div>
                <div>
                  <h3 className="font-raleway text-sm font-bold text-white">Express Motorbike Dispatch</h3>
                  <p className="text-[10px] font-poppins text-zinc-400">
                    Standard Courier Package • Up to 10 kg
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                Dynamic Fare
              </span>
            </div>

            {/* Fare Summary */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-raleway text-lg font-bold text-white">Fare</span>
              <span className="font-aldrich text-2xl font-bold text-amber-400">
                GH₵ {simBreakdown.finalFare.toFixed(2)}
              </span>
            </div>

            {/* Itemized Calculation Breakdown Table */}
            <div className="space-y-2 text-xs font-poppins pt-2 border-t border-zinc-800/80">
              
              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400">Minimum price</span>
                <span className="border-b border-dotted border-zinc-700 flex-1 mx-2" />
                <span className="font-mono text-white">GH₵ {simBreakdown.minimumPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400">Start (Base)</span>
                <span className="border-b border-dotted border-zinc-700 flex-1 mx-2" />
                <span className="font-mono text-white">GH₵ {simBreakdown.startFare.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400">
                  Per km ({simBreakdown.distanceKm} KM @ GH₵ {simBreakdown.ratePerKm}/KM)
                </span>
                <span className="border-b border-dotted border-zinc-700 flex-1 mx-2" />
                <span className="font-mono text-white">GH₵ {simBreakdown.distanceCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400">
                  Per min (~{simBreakdown.estimatedMinutes} MIN @ GH₵ {simBreakdown.ratePerMin}/MIN)
                </span>
                <span className="border-b border-dotted border-zinc-700 flex-1 mx-2" />
                <span className="font-mono text-white">GH₵ {simBreakdown.timeCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-300">
                <span className="text-zinc-400">
                  Dispatch Fee ({simBreakdown.bookingFeePercent}%)
                </span>
                <span className="border-b border-dotted border-zinc-700 flex-1 mx-2" />
                <span className="font-mono text-white">GH₵ {simBreakdown.bookingFeeAmount.toFixed(2)}</span>
              </div>

            </div>

            <p className="text-[10px] text-zinc-500 font-poppins pt-2 border-t border-zinc-800 leading-relaxed">
              The price estimation calculates in real-time based on the store pickup GPS and the buyer's dropoff location using the rates above.
            </p>
          </div>

        </div>

        {/* Global Save Button at bottom */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Globally to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings Globally</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

