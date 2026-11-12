import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Flame,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { EditableText } from '../cms/EditableText';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const { isAdmin } = useAuth();
  const { getContent, openAdminLogin } = useSiteContent();
  const { success } = useToast();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const phone = getContent('contact_phone', '+233 54 323 6328');
  const emailVal = getContent('contact_email', 'support@crossfadedgh.com');
  const address = getContent('contact_address', 'Accra, Greater Accra Region, Ghana');
  const hours = getContent('contact_hours', 'Monday – Sunday: 9:00 AM – 10:00 PM GMT');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    success('Welcome to the CrossFaded Inner Circle! Look out for exclusive drop announcements.');
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-black text-zinc-300 border-t border-zinc-900 select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP TRUST & CRAFTSMANSHIP VALUE STRIP */}
      {/* ========================================================================= */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 py-5 sm:py-8">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-aldrich text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  Accra Express Dispatch
                </h4>
                <p className="font-poppins text-[10px] sm:text-[11px] text-zinc-400">
                  Same-day discreet courier delivery
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-aldrich text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  Aerospace 6061 Alloys
                </h4>
                <p className="font-poppins text-[10px] sm:text-[11px] text-zinc-400">
                  Zero toxic metallic flakes
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400/20" />
              </div>
              <div>
                <h4 className="font-aldrich text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  Spanish Cedar Cured
                </h4>
                <p className="font-poppins text-[10px] sm:text-[11px] text-zinc-400">
                  Constant 70% RH humidor aging
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-aldrich text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  Doorstep COD & MoMo
                </h4>
                <p className="font-poppins text-[10px] sm:text-[11px] text-zinc-400">
                  Inspect upon delivery before pay
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIP SYNDICATE / INNER CIRCLE NEWSLETTER BAR */}
      {/* ========================================================================= */}
      <div className="border-b border-zinc-900 bg-gradient-to-r from-zinc-950 via-[#111111] to-zinc-950 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
            
            {/* Left: VIP Info */}
            <div className="text-center lg:text-left space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The CrossFaded Syndicate</span>
              </div>
              <h3 className="font-anton text-2xl sm:text-3xl text-white tracking-wide uppercase">
                <EditableText
                  contentKey="footer_vip_title"
                  defaultValue="JOIN THE CROSSFADED INNER CIRCLE."
                  label="Footer VIP Title"
                  page="Footer"
                  as="span"
                />
              </h3>
              <p className="font-poppins text-xs text-zinc-400 leading-relaxed">
                <EditableText
                  contentKey="footer_vip_desc"
                  defaultValue="Receive private drops, limited humidor vintage arrivals, and exclusive VIP session access in Accra."
                  label="Footer VIP Description"
                  page="Footer"
                  as="span"
                />
              </p>
            </div>

            {/* Right: Modern Subscription Form */}
            <div className="w-full lg:w-auto lg:min-w-[420px]">
              <form onSubmit={handleNewsletterSubmit} className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-black border border-zinc-800 rounded-full py-3 pl-4 pr-32 sm:pr-36 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 sm:px-5 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  {subscribed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>Joined!</span>
                    </>
                  ) : (
                    <>
                      <span>Join VIP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
              <p className="text-[10px] font-poppins text-zinc-500 mt-2 text-center lg:text-left">
                Zero spam. Only rare allocations and member privileges. Unsubscribe at any time.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN FOOTER CONTENT COLUMNS */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12">
          
          {/* Column 1: Brand & Identity (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <Link to="/" className="inline-block group">
              <span className="font-anton text-3xl sm:text-4xl tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
                CROSSFADED
              </span>
            </Link>

            <EditableText
              contentKey="footer_brand_tagline"
              defaultValue="CrossFaded is a modern smoking accessories brand offering premium grinders, ashtrays, storage solutions, and lifestyle essentials. We combine quality, style, and functionality to deliver products that elevate every smoking experience."
              label="Footer Brand Statement"
              type="textarea"
              page="Footer"
              as="p"
              className="font-poppins text-xs text-zinc-400 leading-relaxed max-w-sm block"
            />

            {/* 18+ Verification Tag */}
            <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold">
                18+
              </span>
              <span>Adult Luxury Smoking Accessories</span>
            </div>
          </div>

          {/* Column 2: Curated Collections (2 Cols) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h4 className="font-aldrich text-xs font-bold text-white uppercase tracking-widest text-amber-400/90">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs font-poppins text-zinc-400">
              <li>
                <Link
                  to="/products-by-category?category=Herb%20Grinders"
                  className="hover:text-amber-400 transition-colors block"
                >
                  Herb Grinders
                </Link>
              </li>
              <li>
                <Link
                  to="/products-by-category?category=Cigars"
                  className="hover:text-amber-400 transition-colors block"
                >
                  Hand-Rolled Cigars
                </Link>
              </li>
              <li>
                <Link
                  to="/products-by-category?category=Ashtrays"
                  className="hover:text-amber-400 transition-colors block"
                >
                  Heavyweight Ashtrays
                </Link>
              </li>
              <li>
                <Link
                  to="/products-by-category?category=Smoking%20Essentials"
                  className="hover:text-amber-400 transition-colors block"
                >
                  Torches & Cutters
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="hover:text-amber-400 transition-colors block font-semibold text-zinc-300"
                >
                  Browse All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care & Quick Links (2 Cols) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h4 className="font-aldrich text-xs font-bold text-white uppercase tracking-widest text-amber-400/90">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-poppins text-zinc-400">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-amber-400 transition-colors block">
                  Our shop
                </Link>
              </li>
              <li>
                <Link to="/aboutus" className="hover:text-amber-400 transition-colors block">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="hover:text-amber-400 transition-colors block">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-400 transition-colors block text-amber-400/90 font-medium">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-amber-400 transition-colors block">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-amber-400 transition-colors block">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Accra Hub & Concierge (4 Cols) */}
          <div className="lg:col-span-4 text-left space-y-4">
            <h4 className="font-aldrich text-xs font-bold text-white uppercase tracking-widest text-amber-400/90">
              Accra Concierge Hub
            </h4>
            
            <div className="space-y-3.5 text-xs font-poppins text-zinc-400">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Phone & WhatsApp Hotline
                  </span>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="hover:text-amber-400 transition-colors font-bold text-white font-aldrich text-sm"
                  >
                    <EditableText
                      contentKey="contact_phone"
                      defaultValue="+233 54 323 6328"
                      label="Contact Phone"
                      page="Footer"
                    />
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${emailVal}`}
                    className="hover:text-amber-400 transition-colors font-medium text-white"
                  >
                    <EditableText
                      contentKey="contact_email"
                      defaultValue="support@crossfadedgh.com"
                      label="Contact Email"
                      page="Footer"
                    />
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Dispatch Hub
                  </span>
                  <EditableText
                    contentKey="contact_address"
                    defaultValue="Accra, Greater Accra Region, Ghana"
                    label="Dispatch Location"
                    page="Footer"
                    as="span"
                    className="text-zinc-300 font-medium"
                  />
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                    Operating Hours
                  </span>
                  <EditableText
                    contentKey="contact_hours"
                    defaultValue="Monday – Sunday: 9:00 AM – 10:00 PM GMT"
                    label="Customer Service Hours"
                    page="Footer"
                    as="span"
                    className="text-zinc-300"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LEGAL NOTICE BANNER (18+ & Responsibility) */}
      {/* ========================================================================= */}
      <div className="border-t border-zinc-900 bg-zinc-950/80 py-4">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 text-center">
          <EditableText
            contentKey="footer_warning_notice"
            defaultValue="18+ ADULT LUXURY HARDWARE • Strictly intended for legal age adults in Ghana. Please enjoy responsibly."
            label="Footer Adult Warning Notice"
            page="Footer"
            as="p"
            className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase block"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM BAR: COPYRIGHT & CMS ACCESS */}
      {/* ========================================================================= */}
      <div className="border-t border-zinc-900 bg-black py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-poppins gap-3 sm:gap-4">
          
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <EditableText
              contentKey="footer_copyright"
              defaultValue={`© ${new Date().getFullYear()} CROSSFADED. All Rights Reserved.`}
              label="Copyright Text"
              page="Footer"
              as="p"
            />
          </div>

          {/* Center Brand Note */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-600 font-mono">
            <span>ENGINEERED FOR ACCRA CONNOISSEURS</span>
          </div>

          {/* Admin CMS Access */}
          <div>
            {isAdmin ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-amber-400 transition-colors font-mono"
                title="Open Administrator Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Dashboard</span>
              </Link>
            ) : (
              <button
                onClick={openAdminLogin}
                className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-amber-400 transition-colors font-mono"
                title="Sign in as Administrator on this page"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>Admin Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>

    </footer>
  );
};
