import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, MapPin, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AddressAutocomplete } from '../ui/AddressAutocomplete';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    authRedirectUrl,
    setAuthRedirectUrl,
    closeAuthModal,
    signIn,
    signUp,
  } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [placename, setPlacename] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');

  // Keep internal tab synchronized when opened
  React.useEffect(() => {
    setTab(authModalTab);
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetRedirect = authRedirectUrl;
      setAuthRedirectUrl(null);

      if (tab === 'login') {
        const isAdminUser = await signIn(email, password);
        closeAuthModal();
        if (targetRedirect) {
          success('Welcome back! Proceeding with your order...');
          navigate(targetRedirect);
        } else if (isAdminUser) {
          success('Welcome to CrossFaded Admin Dashboard!');
          navigate('/admin/dashboard');
        } else {
          success('Welcome back to CrossFaded!');
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

        try {
          sessionStorage.setItem('crossfaded_pending_delivery', JSON.stringify(deliveryInfo));
        } catch {}

        await signUp(email, password, deliveryInfo);
        closeAuthModal();
        if (targetRedirect) {
          success('Account created! Confirming your order & delivery details...');
          navigate(targetRedirect);
        } else {
          success('Account created successfully! Welcome to CrossFaded.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#212121] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10"
        >
          {/* Top amber banner */}
          <div className="h-1.5 bg-amber-400" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-black/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="font-anton text-3xl tracking-wider text-amber-400">
                CROSSFADED
              </span>
              <p className="text-xs text-zinc-400 mt-1 font-poppins">
                {tab === 'login'
                  ? 'Sign in to access your orders and saved details'
                  : 'Create an account to join the CrossFaded VIP club'}
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex bg-black/50 p-1 rounded-lg mb-6 border border-zinc-800">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded transition-all font-poppins ${
                  tab === 'login'
                    ? 'bg-amber-400 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded transition-all font-poppins ${
                  tab === 'register'
                    ? 'bg-amber-400 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-poppins">
              {tab === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        First Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          placeholder="Kofi"
                          className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 pl-8"
                        />
                        <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Last Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          placeholder="Mensah"
                          className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="054 123 4567"
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 pl-8"
                      />
                      <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Accra"
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="Greater Accra"
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
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
                      placeholder="Street, neighborhood, or landmark..."
                      required={false}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 pl-8"
                  />
                  <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 pl-8 pr-10"
                  />
                  <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-semibold text-xs rounded tracking-wider uppercase transition-all shadow active:scale-[0.99] font-poppins"
              >
                {loading
                  ? 'Processing...'
                  : tab === 'login'
                  ? 'Sign In to CrossFaded'
                  : 'Complete Registration'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
