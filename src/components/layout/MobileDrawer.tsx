import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  ShoppingBag,
  Grid,
  Info,
  Phone,
  Package,
  Truck,
  User,
  ShieldCheck,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, profile, isAdmin, signOut, openAuthModal } = useAuth();
  const { openAdminLogin } = useSiteContent();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Our Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Categories', path: '/categories', icon: Grid },
    { label: 'Track Order', path: '/track', icon: Truck },
    { label: 'My Orders', path: '/orders', icon: Package },
    { label: 'About Us', path: '/aboutus', icon: Info },
    { label: 'Contact Us', path: '/contactus', icon: Phone },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 max-w-xs w-full bg-[#212121] border-l border-zinc-800 shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <span className="font-anton text-2xl tracking-wider text-amber-400">
                  CROSSFADED
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-black/40 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Bar */}
              <div className="p-5 border-b border-zinc-800 bg-black/40">
                {user ? (
                  <button
                    onClick={() => {
                      onClose();
                      navigate(isAdmin ? '/admin/dashboard' : '/account');
                    }}
                    className="w-full flex items-center gap-3 text-left hover:opacity-85 transition-opacity"
                    title={isAdmin ? 'Admin Dashboard' : 'My Account'}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-sm uppercase font-aldrich">
                      {profile?.firstname ? profile.firstname[0] : user.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate font-poppins">
                        {profile?.firstname ? `${profile.firstname} ${profile.lastname || ''}` : 'Customer'}
                      </p>
                      <p className="text-xs text-amber-400 truncate font-poppins font-medium">
                        {isAdmin ? 'Admin Dashboard →' : 'View Account →'}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div>
                    <p className="text-xs text-zinc-400 mb-2 font-poppins">Welcome to CrossFaded</p>
                    <button
                      onClick={() => {
                        onClose();
                        openAuthModal('login');
                      }}
                      className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded transition-colors font-poppins tracking-wide shadow"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}
              </div>

              {/* Nav links */}
              <div className="p-3 space-y-1 font-poppins">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                          : 'text-zinc-300 hover:bg-black/30 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-amber-400" />
                      {link.label}
                    </Link>
                  );
                })}

                {user && (
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-300 hover:bg-black/30 hover:text-white transition-all"
                  >
                    <User className="w-5 h-5 text-amber-400" />
                    Account Settings
                  </Link>
                )}

                {isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Admin Panel
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      openAdminLogin();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-amber-400/90 hover:text-amber-400 hover:bg-black/30 transition-all text-left"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    Admin Live CMS Sign-In
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-zinc-800 space-y-3 font-poppins">
              <a
                href="https://wa.me/233543236328?text=Hello%20CrossFaded"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold tracking-wide transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>

              {user && (
                <button
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

