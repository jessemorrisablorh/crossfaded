import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Phone,
  User,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Save,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { firestoreService, DEFAULT_DELIVERY_SETTINGS } from '../services/firestoreService';
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete';
import { calculateDistanceKm, calculateDeliveryFee, getDeliveryFareBreakdown } from '../services/deliveryService';
import { DeliverySettings } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart, isCartLoading } = useCart();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState(profile?.firstname || '');
  const [lastname, setLastname] = useState(profile?.lastname || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [placename, setPlacename] = useState(profile?.placename || profile?.address || '');
  const [lat, setLat] = useState<number | undefined>(profile?.lat);
  const [lng, setLng] = useState<number | undefined>(profile?.lng);
  const [city, setCity] = useState(profile?.city || 'Accra');
  const [region, setRegion] = useState(profile?.region || 'Greater Accra');
  const [note, setNote] = useState(sessionStorage.getItem('crossfaded_order_note') || '');
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);
  const [saveDetailsForFuture, setSaveDetailsForFuture] = useState(true);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const isOrderPlacedRef = useRef(false);

  // Subscribe to global delivery settings (pickup location, base fee +20, rate per km, api key)
  useEffect(() => {
    const unsub = firestoreService.subscribeDeliverySettings((s) => {
      setDeliverySettings(s);
    });
    return () => unsub();
  }, []);

  // 1. Check if user is signed in. If not, redirect to authentication page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // 2. Load saved user delivery information from Cloud Firestore profile or pending registration
  useEffect(() => {
    if (profile) {
      if (profile.firstname) setFirstname(profile.firstname);
      if (profile.lastname) setLastname(profile.lastname);
      if (profile.phone) setPhone(profile.phone);
      if (profile.address) setAddress(profile.address);
      if (profile.placename) setPlacename(profile.placename);
      if (typeof profile.lat === 'number') setLat(profile.lat);
      if (typeof profile.lng === 'number') setLng(profile.lng);
      if (profile.city) setCity(profile.city);
      if (profile.region) setRegion(profile.region);
      return;
    }

    // Fallback: check sessionStorage pending registration delivery info
    try {
      const pendingStr = sessionStorage.getItem('crossfaded_pending_delivery');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.firstname) setFirstname(pending.firstname);
        if (pending.lastname) setLastname(pending.lastname);
        if (pending.phone) setPhone(pending.phone);
        if (pending.address) setAddress(pending.address);
        if (pending.placename) setPlacename(pending.placename);
        if (typeof pending.lat === 'number') setLat(pending.lat);
        if (typeof pending.lng === 'number') setLng(pending.lng);
        if (pending.city) setCity(pending.city);
        if (pending.region) setRegion(pending.region);
      }
    } catch {}
  }, [profile]);


  // Distance calculation (Haversine formula between store pickup and buyer dropoff)
  const distanceKm =
    typeof lat === 'number' && typeof lng === 'number'
      ? calculateDistanceKm(
          deliverySettings.pickupLat,
          deliverySettings.pickupLng,
          lat,
          lng
        )
      : 0;

  // Delivery fee calculation
  const fareBreakdown = getDeliveryFareBreakdown(distanceKm, deliverySettings, totalPrice);
  const isFreeDelivery = fareBreakdown.isFreeDelivery;
  const deliveryFee =
    typeof lat === 'number' && typeof lng === 'number'
      ? fareBreakdown.finalFare
      : isFreeDelivery
      ? 0
      : deliverySettings.startFare || deliverySettings.baseFee || 15;

  const grandTotal = totalPrice + deliveryFee;

  // Manual save details to Cloud Firestore on demand
  const handleQuickSaveDetails = async () => {
    if (!user) return;
    if (!firstname.trim() || !lastname.trim() || !phone.trim() || !address.trim()) {
      toastError('Please fill in your name, phone, and address before saving.');
      return;
    }
    setIsSavingManual(true);
    try {
      await firestoreService.updateUserProfile(user.uid, {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        phone: phone.trim(),
        address: address.trim(),
        placename: placename || address.trim(),
        lat,
        lng,
        city: city.trim(),
        region: region.trim(),
      });
      await refreshProfile();
      success('Delivery details & GPS coordinates saved globally!');
    } catch (err) {
      console.error(err);
      toastError('Failed to save details to cloud.');
    } finally {
      setIsSavingManual(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!firstname.trim() || !lastname.trim() || !phone.trim() || !address.trim()) {
      toastError('Please complete all required delivery details.');
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId || item.productid || item.id,
        productname: item.productname,
        productimage: item.productimage,
        price: item.price,
        quantity: item.quantity,
      }));

      const generatedOrderNumber = `CF-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData = {
        uid: user.uid,
        orderNumber: generatedOrderNumber,
        customerName: `${firstname.trim()} ${lastname.trim()}`,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: user.email || '',
        phone: phone.trim(),
        address: address.trim(),
        placename: placename || address.trim(),
        lat,
        lng,
        distance_km: distanceKm,
        delivery_fee: deliveryFee,
        city: city.trim(),
        region: region.trim(),
        note: note.trim(),
        total: grandTotal,
        paid: false,
        payment_method: 'cod' as const,
        payment_method_title: 'Cash On Delivery',
        status: 'pending' as const,
        cartitems: orderItems,
      };

      const orderId = await firestoreService.createOrder(orderData);
      isOrderPlacedRef.current = true;

      // If user opted to save details for future purchases, save to Cloud Firestore
      if (saveDetailsForFuture) {
        firestoreService
          .updateUserProfile(user.uid, {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            phone: phone.trim(),
            address: address.trim(),
            placename: placename || address.trim(),
            lat,
            lng,
            city: city.trim(),
            region: region.trim(),
          })
          .then(() => refreshProfile())
          .catch(console.warn);
      }

      try {
        await clearCart();
      } catch (clearErr) {
        console.warn('Cart clear issue:', clearErr);
      }

      try {
        sessionStorage.removeItem('crossfaded_order_note');
        sessionStorage.removeItem('crossfaded_pending_delivery');
      } catch {}

      // Immediately navigate to order success confirmation page with order id & tracking number
      navigate(`/success?orderId=${orderId}&num=${generatedOrderNumber}`, { replace: true });
    } catch (err) {
      console.error('Order placement error:', err);
      toastError('Failed to place order. Please try again or message us on WhatsApp.');
    } finally {
      if (!isOrderPlacedRef.current) {
        setLoading(false);
      }
    }
  };

  // Loading state while verifying authentication or syncing cart
  if (authLoading || isCartLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 text-zinc-400">
        <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4" />
        <p className="font-raleway text-sm font-semibold text-white tracking-wider">
          Loading your order & delivery calculations...
        </p>
      </div>
    );
  }

  // Not signed in fallback screen (while redirecting)
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-3 sm:p-6">
        <div className="max-w-md w-full bg-[#212121] border border-zinc-800 rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-700 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="font-aldrich text-xl sm:text-2xl font-bold text-white">Sign In Required</h2>
            <p className="text-xs text-zinc-400 font-poppins mt-2">
              Please sign in or create an account to proceed to checkout and secure your order.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md text-center font-raleway"
            >
              Sign In to Proceed
            </Link>
            <Link
              to="/login?tab=register&redirect=/checkout"
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all text-center font-raleway"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback (rendered inline if not placing an order)
  if (items.length === 0 && !isOrderPlacedRef.current && !loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-3 sm:p-6 text-zinc-400">
        <div className="max-w-md w-full bg-[#212121] border border-zinc-800 rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-700 flex items-center justify-center text-amber-400 mx-auto">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="font-aldrich text-xl sm:text-2xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-xs text-zinc-400 font-poppins mt-2">
              You do not have any items in your cart to checkout. Browse our collection to add your favorite smoking accessories.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/shop"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md text-center font-raleway flex items-center justify-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-400 transition-colors mb-4 sm:mb-8 font-poppins"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>

        <div className="mb-4 sm:mb-6">
          <h1 className="font-raleway text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Checkout & Order Confirmation
          </h1>
          <p className="font-poppins text-xs text-zinc-400 mt-1 sm:mt-2">
            Confirm your delivery details, check your distance-based delivery fee, and place your order.
          </p>
        </div>

        {/* Order confirmation guidance banner */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border border-amber-400/30 bg-amber-400/10 flex items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-black border border-zinc-700 text-amber-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold font-raleway text-white uppercase tracking-wider">
                Confirm Delivery Address & Calculated Delivery Fee
              </h3>
              <p className="text-xs text-zinc-300 font-poppins mt-0.5">
                Review your delivery address below. Your delivery fee is calculated by distance from our store. You can choose whether to save these details for your next purchase.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
            
            {/* Left: Shipping & Billing Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Delivery Address Card (#212121) */}
              <div className="p-3.5 sm:p-6 lg:p-8 rounded-xl bg-[#212121] border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    <h2 className="font-raleway text-lg font-bold text-white">Delivery Information</h2>
                  </div>

                  {profile?.address ? (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved Delivery Profile Loaded
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                      <Sparkles className="w-3.5 h-3.5" /> Initial Setup
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      placeholder="e.g. Samuel"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      placeholder="e.g. Owusu"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                    Phone Number (WhatsApp or Calls) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 054 323 6328"
                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1 font-poppins">
                    Our dispatch rider will call this number prior to arrival.
                  </p>
                </div>

                <AddressAutocomplete
                  label="Street Address & Delivery Landmark"
                  value={address}
                  onChange={setAddress}
                  selectedCoords={{ lat, lng, placename }}
                  onPlaceSelect={(place) => {
                    setAddress(place.placename);
                    setPlacename(place.placename);
                    setLat(place.lat);
                    setLng(place.lng);
                  }}
                  placeholder="e.g. Type East Legon, Cantonments, or street..."
                  required
                  helperText="Select a suggested location to calculate your exact delivery fee based on distance."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Accra"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                      Region in Ghana *
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Greater Accra">Greater Accra Region</option>
                      <option value="Ashanti">Ashanti Region (Kumasi)</option>
                      <option value="Central">Central Region (Cape Coast)</option>
                      <option value="Western">Western Region (Takoradi)</option>
                      <option value="Eastern">Eastern Region (Koforidua)</option>
                      <option value="Volta">Volta Region (Ho)</option>
                      <option value="Northern">Northern Region (Tamale)</option>
                      <option value="Other">Other Ghana Regions</option>
                    </select>
                  </div>
                </div>

                {/* Save delivery details to Cloud Firestore prompt */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveDetailsForFuture}
                      onChange={(e) => setSaveDetailsForFuture(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-amber-400 focus:ring-amber-400 border-zinc-700 bg-zinc-900 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white font-poppins">
                          Save delivery details to my account
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                          Cloud Sync
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 font-poppins leading-relaxed">
                        Save your delivery name, phone, and address to Cloud Firestore so your details automatically load on any device globally for future purchases.
                      </p>
                    </div>
                  </label>

                  <div className="flex justify-end pt-1 border-t border-amber-500/15">
                    <button
                      type="button"
                      onClick={handleQuickSaveDetails}
                      disabled={isSavingManual || !address.trim() || !phone.trim()}
                      className="text-xs text-amber-400 hover:text-amber-300 font-poppins font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingManual ? 'Saving to Cloud...' : 'Update & Save Details Now'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 font-poppins">
                    Order Note / Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Please deliver around 5:00 PM, gate buzzer #4..."
                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Payment Method Card (#212121) */}
              <div className="p-3.5 sm:p-6 lg:p-8 rounded-xl bg-[#212121] border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                  <Banknote className="w-5 h-5 text-amber-400" />
                  <h2 className="font-raleway text-lg font-bold text-white">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-amber-400 bg-amber-400/10 cursor-pointer transition-all"
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={true}
                      readOnly
                      className="mt-1 text-amber-400 focus:ring-amber-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white font-poppins">Cash On Delivery (COD)</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-400 text-black">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-poppins">
                        Pay in cash directly to the dispatch rider upon receiving your package.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right: Order Review & Submit (5 Cols) (#212121) */}
            <div className="lg:col-span-5 bg-[#212121] border border-zinc-800 rounded-xl p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 sticky top-28 shadow-xl">
              <h2 className="font-raleway text-xl font-bold text-white pb-4 border-b border-zinc-800">
                Order Review ({items.length})
              </h2>

              {/* Items summary */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-zinc-800">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.productimage || '/images/cigar.png'}
                      alt={item.productname}
                      className="w-14 h-14 object-contain rounded-lg bg-black border border-zinc-800 shrink-0 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate font-poppins">
                        {item.productname}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-poppins">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-aldrich text-xs font-bold text-amber-400">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs font-poppins">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-aldrich font-semibold">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Delivery Fee</span>
                  <span className="text-white font-aldrich font-semibold">
                    {fareBreakdown.isFreeDelivery ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white font-poppins">Total Amount Due</span>
                  <span className="font-aldrich text-2xl font-bold text-amber-400">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-poppins font-semibold text-xs uppercase tracking-widest rounded transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Securing Your Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 fill-black" />
                    <span>Confirm & Place Order</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2 font-poppins">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero pre-payment risk. Inspect your items before completing payment.</span>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};
