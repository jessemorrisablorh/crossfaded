import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Package,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { firestoreService } from '../services/firestoreService';

export const AccountPage: React.FC = () => {
  const { user, profile, isAdmin, signOut, openAuthModal, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstname(profile.firstname || '');
      setLastname(profile.lastname || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setRegion(profile.region || 'Greater Accra');
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center text-center p-6 text-zinc-400">
        <User className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="font-aldrich text-2xl font-bold text-white mb-2">My Account</h2>
        <p className="text-xs text-zinc-400 mb-6 max-w-sm font-poppins">
          Please sign in to manage your saved billing addresses and order history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await firestoreService.updateUserProfile(user.uid, {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        region: region.trim(),
      });
      await refreshProfile();
      success('Account details updated successfully!');
    } catch (err) {
      console.error(err);
      toastError('Failed to update account information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-2xl font-aldrich">
              {profile?.firstname ? profile.firstname[0] : user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {profile?.firstname ? `${profile.firstname} ${profile.lastname || ''}` : 'My Account'}
                </h1>
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-poppins">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-xl transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <button
              onClick={() => {
                signOut();
                navigate('/');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 text-xs font-semibold rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Links banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/orders"
            className="p-5 rounded-xl bg-[#212121] border border-zinc-800 hover:border-amber-400 transition-all flex items-center justify-between group shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black border border-zinc-700 text-amber-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors font-poppins">
                  Order History & Tracking
                </p>
                <p className="text-xs text-zinc-400 font-poppins">View past and pending orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/cart"
            className="p-5 rounded-xl bg-[#212121] border border-zinc-800 hover:border-amber-400 transition-all flex items-center justify-between group shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black border border-zinc-700 text-amber-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors font-poppins">
                  Active Shopping Cart
                </p>
                <p className="text-xs text-zinc-400 font-poppins">Manage saved items</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Details Form */}
        <div className="p-3.5 sm:p-8 rounded-xl bg-[#212121] border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-zinc-800">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h2 className="font-raleway text-lg font-bold text-white">Default Billing & Delivery Details</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 font-poppins">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 054 323 6328"
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Street Address & Landmarks
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House No. 12, Boundary Road"
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Region in Ghana
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Greater Accra">Greater Accra Region</option>
                  <option value="Ashanti">Ashanti Region</option>
                  <option value="Central">Central Region</option>
                  <option value="Western">Western Region</option>
                  <option value="Eastern">Eastern Region</option>
                  <option value="Volta">Volta Region</option>
                  <option value="Northern">Northern Region</option>
                  <option value="Other">Other Region</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-semibold text-xs uppercase tracking-wider rounded transition-all shadow active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

