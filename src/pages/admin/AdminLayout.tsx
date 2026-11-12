import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Package,
  Sliders,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-mono text-sm">
        Verifying Administrative Credentials...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-zinc-400">
        <ShieldCheck className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="font-aldrich text-2xl font-bold text-white mb-2">Restricted Admin Access</h1>
        <p className="text-xs text-zinc-400 mb-6 max-w-sm">
          You must be signed in with an authorized CrossFaded administrator account to view this portal.
        </p>
        <div className="flex gap-4">
          <Link
            to="/admin/login"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-all"
          >
            Admin Sign In
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl border border-zinc-800 transition-all"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Grid },
    { label: 'Orders', path: '/admin/orders', icon: Package },
    { label: 'Hero Sliders', path: '/admin/sliders', icon: Sliders },
    { label: 'Delivery & Places API', path: '/admin/settings', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-zinc-200">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/80 border-r border-zinc-800 p-3.5 sm:p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="pb-4 sm:pb-6 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-anton text-xl sm:text-2xl tracking-wider text-amber-400">
                CROSSFADED
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 font-mono">ADMIN PORTAL 2.0</span>
              </div>
            </div>
            <Link
              to="/"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="View Public Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Admin User Info Pill */}
          <div className="my-3 sm:my-4 p-2 sm:p-2.5 rounded-xl bg-black/60 border border-zinc-850 flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
              A
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate block">
                {user?.email?.split('@')[0] || 'Administrator'}
              </span>
              <span className="text-[10px] text-zinc-500 truncate block">
                {user?.email || 'Admin Session'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-3 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-1 sm:gap-1.5 md:space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 sm:pt-6 border-t border-zinc-800 flex md:flex-col justify-between items-center md:items-stretch gap-2 mt-4 md:mt-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-400 transition-colors py-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <button
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="flex items-center gap-2 text-xs text-red-400 hover:bg-red-950/40 p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

