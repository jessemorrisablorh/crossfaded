import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { user, profile, isAdmin, openAuthModal } = useAuth();
  const { openAdminLogin, isEditMode, setIsEditMode } = useSiteContent();
  const { itemCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { currency, setCurrency } = useCurrency();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close currency dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search filter
  const searchSuggestions = searchTerm.trim()
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
          
          {/* Left Desktop Navigation Links (matching Flutter DesktopHeader) */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link
              to="/"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/') ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/shop') ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
              }`}
            >
              Our shop
            </Link>
            <Link
              to="/categories"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/categories') ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/track"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/track') ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
              }`}
            >
              Track Order
            </Link>
            <Link
              to="/aboutus"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/aboutus') ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
              }`}
            >
              About us
            </Link>
            <Link
              to="/contactus"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/contactus') ? 'text-amber-400 font-bold' : 'text-white hover:text-amber-400'
              }`}
            >
              Contact us
            </Link>
          </nav>

          {/* Mobile hamburger menu toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={onOpenMobileMenu}
              className="p-2 text-white hover:text-amber-400 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Center Brand Logo (CrossFaded in Google Anton font in Amber, matching Flutter) */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link to="/" className="inline-block group">
              <span className="font-anton text-2xl sm:text-3xl md:text-4xl tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
                CROSSFADED
              </span>
            </Link>
          </div>

          {/* Right Action Icons: Currency, Search, Wishlist, Account, Cart */}
          <div className="flex items-center space-x-1.5 sm:space-x-4">
            
            {/* Currency Selector */}
            <div className="relative hidden md:block" ref={currencyRef}>
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-black/40 border border-zinc-700 text-xs text-zinc-200 hover:text-amber-400 font-mono font-semibold transition-colors"
                title="Currency"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              <AnimatePresence>
                {currencyDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-28 bg-[#1a1a1a] border border-zinc-700 rounded-xl p-1 shadow-2xl z-50 text-xs font-mono"
                  >
                    {(['GHS', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCurrency(c);
                          setCurrencyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                          currency === c
                            ? 'bg-amber-500 text-black font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{c}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Search Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="p-2 text-white hover:text-amber-400 transition-colors rounded-lg hover:bg-black/30"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search popup dropdown */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#1e1e1e] border border-zinc-700 rounded-2xl p-4 shadow-2xl z-50"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search grinders, ashtrays, cigars..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                      <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </form>

                    {/* Suggestions list */}
                    {searchSuggestions.length > 0 && (
                      <div className="mt-3 border-t border-zinc-800 pt-2 space-y-1">
                        <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold px-2 mb-1">
                          Products
                        </p>
                        {searchSuggestions.map((item) => (
                          <button
                            key={item.productId || item.id}
                            onClick={() => {
                              navigate(`/product/${item.productId || item.id}`);
                              setSearchOpen(false);
                              setSearchTerm('');
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 text-left transition-colors group"
                          >
                            <img
                              src={item.imageUrls?.[0] || item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded bg-zinc-800"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate group-hover:text-amber-400">
                                {item.name}
                              </p>
                              <p className="text-xs text-amber-400 font-mono">
                                GHS {item.salePrice || item.price}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Trigger */}
            <button
              onClick={openWishlist}
              className="relative p-2 text-white hover:text-amber-400 rounded-lg hover:bg-black/30 transition-colors group"
              aria-label="View Saved Favorites"
            >
              <Heart className="w-5 h-5 transition-transform group-hover:scale-105" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-400 text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-black">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Admin Live CMS Direct Trigger */}
            <button
              onClick={() => {
                if (!isAdmin) {
                  openAdminLogin();
                } else {
                  setIsEditMode(!isEditMode);
                }
              }}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                isAdmin
                  ? isEditMode
                    ? 'text-amber-400 bg-amber-400/15 ring-1 ring-amber-400/50'
                    : 'text-amber-400/80 bg-zinc-900 hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-900'
              }`}
              title={
                isAdmin
                  ? `Admin CMS: Live Editing is ${isEditMode ? 'ON' : 'OFF'} (Click to toggle)`
                  : 'Admin Live CMS Sign-In'
              }
              aria-label="Admin Live CMS Access"
            >
              <ShieldCheck className="w-5 h-5" />
              {isAdmin && (
                <span className="hidden xl:inline text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  {isEditMode ? 'EDIT ON' : 'EDIT OFF'}
                </span>
              )}
            </button>

            {/* Account / User Direct Action:
                - If not logged in -> directly open authentication screen
                - If logged in -> show dashboard according to user role (/admin/dashboard or /account)
            */}
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else if (isAdmin) {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/account');
                }
              }}
              className="flex items-center gap-1.5 p-1.5 text-white hover:text-amber-400 rounded-lg transition-colors group"
              aria-label={user ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Sign in'}
              title={user ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Sign In / Register'}
            >
              <UserIcon className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wide text-white group-hover:text-amber-400 transition-colors">
                {user ? (profile?.firstname || user.email?.split('@')[0]) : 'Account'}
              </span>
            </button>

            {/* Cart Trigger with Amber Badge */}
            <button
              onClick={openCart}
              className="relative p-2 text-white hover:text-amber-400 rounded-lg hover:bg-black/30 transition-colors group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:scale-105 text-white" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-400 text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#212121]">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
