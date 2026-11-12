import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { EditableText } from '../components/cms/EditableText';
import { useSiteContent } from '../context/SiteContentContext';

export const ContactPage: React.FC = () => {
  const { success } = useToast();
  const { getContent } = useSiteContent();

  const phone = getContent('contact_phone', '+233 54 323 6328');
  const emailVal = getContent('contact_email', 'support@crossfadedgh.com');
  const addressVal = getContent('contact_address', 'Accra, Greater Accra Region, Ghana');
  const whatsappUrl = getContent(
    'contact_whatsapp_link',
    'https://wa.me/233543236328?text=Hello%20CrossFaded!%20I%20have%20an%20inquiry.'
  );

  const [inquiryType, setInquiryType] = useState('Order & Delivery');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const inquiryTypes = [
    'Order & Delivery',
    'Product Specs & Advice',
    'Wholesale & Bulk Orders',
    'General Inquiry',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message sent! Our support team will get back to you shortly.');
    setName('');
    setEmail('');
    setPhoneInput('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md mb-5">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <EditableText
              contentKey="contact_page_tag"
              defaultValue="CUSTOMER CARE & CONCIERGE"
              label="Contact Page Tag"
              page="Contact"
            />
          </div>

          <h1 className="font-anton text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.08] mb-6">
            <EditableText
              contentKey="contact_page_title"
              defaultValue="CONNECT WITH"
              label="Contact Page Headline"
              page="Contact"
            />{' '}
            <EditableText
              contentKey="contact_page_highlight"
              defaultValue="CROSSFADED."
              label="Contact Page Highlight"
              page="Contact"
              className="text-amber-400 block sm:inline"
            />
          </h1>

          <EditableText
            contentKey="contact_page_subtitle"
            defaultValue="Have questions regarding live stock availability in Accra, ring gauge specifications, or same-day dispatch? Our team is available 7 days a week."
            label="Contact Page Subtitle"
            type="textarea"
            page="Contact"
            as="p"
            className="font-poppins text-sm sm:text-base text-zinc-300 leading-relaxed block"
          />
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: WhatsApp Card & Contact Channels (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp VIP Direct Concierge Card */}
            <div className="p-7 sm:p-8 rounded-lg bg-gradient-to-b from-emerald-950/70 to-emerald-950/30 border border-emerald-500/40 shadow-[0_16px_36px_rgba(0,0,0,0.85)] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <img
                    src="/images/whatsapp.png"
                    alt="WhatsApp"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Concierge
                </span>
              </div>

              <div>
                <h3 className="font-aldrich text-xl font-bold text-white">
                  Instant WhatsApp Support
                </h3>
                <p className="font-poppins text-xs text-emerald-200/90 leading-relaxed mt-1">
                  Connect directly with our Accra team for fast answers, customized order bundling, and priority dispatch.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba59] text-white font-poppins font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xl shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
                >
                  <img src="/images/whatsapp.png" alt="" className="w-4 h-4 object-contain" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Direct Contact Channels Card */}
            <div className="p-7 sm:p-8 rounded-lg bg-gradient-to-b from-[#1c1c1c] to-[#131313] shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.08)] space-y-6">
              
              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-black text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    Phone & WhatsApp Hotline
                  </h4>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="font-aldrich text-base font-bold text-white hover:text-amber-400 transition-colors block mt-0.5"
                  >
                    <EditableText
                      contentKey="contact_phone"
                      defaultValue="+233 54 323 6328"
                      label="Hotline Number"
                      page="Contact"
                    />
                  </a>
                  <EditableText
                    contentKey="contact_hours"
                    defaultValue="Monday – Sunday: 9:00 AM – 10:00 PM GMT"
                    label="Customer Support Hours"
                    page="Contact"
                    as="p"
                    className="text-[11px] text-zinc-400 font-poppins mt-0.5 block"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-black text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    Direct Email Inquiries
                  </h4>
                  <a
                    href={`mailto:${emailVal}`}
                    className="font-poppins text-sm font-semibold text-white hover:text-amber-400 transition-colors block mt-0.5"
                  >
                    <EditableText
                      contentKey="contact_email"
                      defaultValue="support@crossfadedgh.com"
                      label="Support Email"
                      page="Contact"
                    />
                  </a>
                  <p className="text-[11px] text-zinc-400 font-poppins mt-0.5">
                    Fast response within 2–4 business hours
                  </p>
                </div>
              </div>

              {/* Physical Location & Dispatch */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-black text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                    Headquarters & Fulfillment
                  </h4>
                  <EditableText
                    contentKey="contact_address"
                    defaultValue="Accra, Greater Accra Region, Ghana"
                    label="Physical Address / Hub"
                    page="Contact"
                    as="p"
                    className="font-poppins text-sm font-semibold text-white mt-0.5 block"
                  />
                  <EditableText
                    contentKey="contact_dispatch_info"
                    defaultValue="Same-day express dispatch to all 16 regions"
                    label="Dispatch Coverage Note"
                    page="Contact"
                    as="p"
                    className="text-[11px] text-zinc-400 font-poppins mt-0.5 block"
                  />
                </div>
              </div>

            </div>

            {/* Fast Fulfillment Badges Card */}
            <div className="p-6 rounded-lg bg-gradient-to-b from-[#1c1c1c] to-[#131313] shadow-[0_12px_32px_rgba(0,0,0,0.85)] space-y-3">
              <div className="flex items-center gap-3 text-xs font-poppins text-zinc-200">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Express 2-hour courier options available in Accra</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-poppins text-zinc-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cash on Delivery (COD) & Mobile Money verified at doorstep</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7 p-7 sm:p-10 rounded-lg bg-gradient-to-b from-[#1c1c1c] to-[#131313] shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.08)] space-y-6">
            
            <div>
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                MESSAGE DIRECTLY
              </span>
              <h2 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Send Us a Message
              </h2>
              <p className="font-poppins text-xs sm:text-sm text-zinc-400 mt-1">
                Select your topic and share details below. We'll follow up via WhatsApp or email.
              </p>
            </div>

            {/* Inquiry Category Pills */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Inquiry Department
              </label>
              <div className="flex flex-wrap gap-2">
                {inquiryTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInquiryType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-poppins font-medium transition-all ${
                      inquiryType === type
                        ? 'bg-amber-400 text-black font-semibold shadow-md'
                        : 'bg-black text-zinc-300 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {submitted && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-xs font-semibold font-poppins animate-fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Thank you! Your message has been received. A representative will contact you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-poppins">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-poppins">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +233 54 323 6328"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-poppins">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kwame@example.com"
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-poppins">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what product you're inquiring about or your order questions..."
                  className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xl shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
