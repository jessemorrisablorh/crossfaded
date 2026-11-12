import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Sparkles,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete';

export const AuthPage: React.FC = () => {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '';
  const initialTab =
    searchParams.get('tab') === 'register' || location.pathname.includes('register')
      ? 'register'
      : 'login';

  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [placename, setPlacename] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [city, setCity] = useState('Accra');
  const [region, setRegion] = useState('Greater Accra');

  // If user is already authenticated, redirect immediately
  useEffect(() => {
    if (!authLoading && user) {
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [user, authLoading, redirectUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === 'login') {
        const isAdminUser = await signIn(email, password);
        if (redirectUrl) {
          success('Welcome back! Proceeding to your order...');
          navigate(redirectUrl, { replace: true });
        } else if (isAdminUser) {
          success('Welcome to CrossFaded Admin Dashboard!');
          navigate('/admin/dashboard', { replace: true });
        } else {
          success('Welcome back to CrossFaded!');
          navigate('/account', { replace: true });
        }
      } else {
        const deliveryInfo = {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          phone: phone.trim(),
          address: address.trim(),
          placename: placename.trim() || address.trim(),
          lat,
          lng,
          city: city.trim(),
          region: region.trim(),
        };

        // Cache in sessionStorage for instantaneous checkout pre-fill
        try {
          sessionStorage.setItem('crossfaded_pending_delivery', JSON.stringify(deliveryInfo));
        } catch {}

        await signUp(email, password, deliveryInfo);

        if (redirectUrl) {
          success('Account created! Confirming your order & delivery details...');
          navigate(redirectUrl, { replace: true });
        } else {
          success('Account created successfully! Welcome to CrossFaded.');
          navigate('/account', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
        setTab('login');
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isCheckoutRedirect = redirectUrl.includes('checkout');

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-12 px-2.5 sm:px-6 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background ambient gold glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand / Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <span className="font-anton text-3xl tracking-wider text-white group-hover:text-amber-400 transition-colors">
              CROSS<span className="text-amber-400 group-hover:text-white">FADED</span>
            </span>
          </Link>

          <p className="font-poppins text-xs text-zinc-400">
            Premium Smoking Accessories & Curated Luxury Goods
          </p>
        </div>

        {/* Notice Banner if coming from Checkout */}
        {isCheckoutRedirect && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 shadow-lg animate-fade-in">
            <div className="p-2 rounded-xl bg-amber-400 text-black shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 font-poppins">
                Sign In to Complete Checkout
              </h4>
              <p className="text-[11px] text-zinc-300 font-poppins mt-0.5 leading-relaxed">
                Log in or create an account to load your saved delivery information and complete your order.
              </p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#212121] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top Gold Stripe */}
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Tab Selector */}
          <div className="grid grid-cols-2 border-b border-zinc-800 bg-black/40">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-4 text-xs font-bold font-raleway tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-[#212121]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-4 text-xs font-bold font-raleway tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-[#212121]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3.5 sm:p-8 space-y-3.5 sm:space-y-4">
            {tab === 'login' ? (
              /* LOGIN FIELDS */
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-raleway"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>{isCheckoutRedirect ? 'Sign In & Proceed to Checkout' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              /* REGISTER FIELDS */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      placeholder="e.g. Kwame"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      placeholder="e.g. Mensah"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                    Phone Number (WhatsApp or Call)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="024 123 4567"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>
                </div>

                <AddressAutocomplete
                  label="Delivery Address"
                  value={address}
                  onChange={setAddress}
                  selectedCoords={{ lat, lng, placename }}
                  onPlaceSelect={(place) => {
                    setAddress(place.placename);
                    setPlacename(place.placename);
                    setLat(place.lat);
                    setLng(place.lng);
                  }}
                  placeholder="Start typing street, area, or landmark..."
                  required
                  helperText="Tap a suggestion below to lock your exact GPS coordinates for distance-based delivery."
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Accra"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                      Region
                    </label>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Greater Accra"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300 font-poppins">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-[11px] text-zinc-400 font-poppins flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Your delivery details will be saved to your profile for automatic 1-click checkout on any device globally.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 font-raleway"
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>{isCheckoutRedirect ? 'Save & Proceed to Checkout' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>

          {/* Footer toggle note */}
          <div className="px-6 py-4 bg-black/40 border-t border-zinc-800 text-center">
            {tab === 'login' ? (
              <p className="text-xs text-zinc-400 font-poppins">
                New to CrossFaded?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-400 font-poppins">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline ml-1"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Session • Cloud Verified</span>
        </div>
      </div>
    </div>
  );
};

