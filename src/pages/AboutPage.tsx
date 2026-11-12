import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Award,
  ShieldCheck,
  Truck,
  ArrowRight,
  Check,
  Gem,
  HeartHandshake,
} from 'lucide-react';
import { EditableText } from '../components/cms/EditableText';
import { EditableImage } from '../components/cms/EditableImage';

export const AboutPage: React.FC = () => {
  const stats = [
    { value: '4.9★', label: 'Average Session Rating', sub: 'From 1,200+ Accra Customers' },
    { value: '6061', label: 'Aerospace Grade Aluminum', sub: 'Zero Toxic Metallic Flakes' },
    { value: '5 Yrs', label: 'Humidor Reserve Cured', sub: 'Spanish Cedar Aged' },
    { value: '< 2 Hrs', label: 'Express Accra Delivery', sub: 'Discreet Unmarked Courier' },
  ];

  const standards = [
    {
      icon: Award,
      tag: 'CNC PRECISION',
      title: 'Zero Metal-Shaving Guarantee',
      desc: 'Precision-machined teeth with smooth nylon glide rings prevent friction wear, ensuring zero toxic metal shavings in your ground herbs.',
    },
    {
      icon: Flame,
      tag: 'HUMIDOR CURED',
      title: 'Spanish Cedar Humidity Control',
      desc: 'Every cigar stick is preserved under constant 68–72% RH in cedar-lined cabinets to guarantee supple wrappers, rich white ash, and even burns.',
    },
    {
      icon: Gem,
      tag: '850G WEIGHTED',
      title: 'Heavyweight Architectural Craft',
      desc: 'Our ashtrays are crafted from optical-grade crystal and architectural concrete with solid brass rests, engineered to stay rooted in coastal Accra winds.',
    },
    {
      icon: Truck,
      tag: 'DISCREET COURIER',
      title: 'Discreet Packaging & COD in Accra',
      desc: 'Plain, unmarked luxury packaging delivered directly to your doorstep in Accra with flexible Cash on Delivery (COD) and Mobile Money verification.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white select-none">
      
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH HERO SECTION (Dark Atmospheric Smoke & Amber Glow) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-black py-28 sm:py-36 lg:py-44">
        {/* Full-Width Dark Smoke Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <img
            src="https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=3840&q=85"
            alt="Dark Atmospheric Smoke"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
          {/* Radial Amber Glow */}
          <div className="absolute right-[12%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 blur-[140px] rounded-full" />
          {/* Edge-to-Edge Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 lg:via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 text-left">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <EditableText
                contentKey="about_hero_tag"
                defaultValue="THE CROSSFADED STORY • ACCRA, GHANA"
                label="About Hero Badge"
                page="About Us"
                as="span"
              />
            </div>

            <h1 className="font-anton text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
              <EditableText
                contentKey="about_hero_title"
                defaultValue="THE ART OF THE"
                label="About Hero Title Prefix"
                page="About Us"
                as="span"
              />{' '}
              <span className="text-amber-400 block sm:inline">
                <EditableText
                  contentKey="about_hero_highlight"
                  defaultValue="ELEVATED SESSION."
                  label="About Hero Title Highlight"
                  page="About Us"
                  as="span"
                />
              </span>
            </h1>

            <p className="font-aldrich text-base sm:text-xl font-semibold text-zinc-200 tracking-wide">
              <EditableText
                contentKey="about_hero_subtitle"
                defaultValue="We engineer functional art: medical-grade alloy crushers, humidor-cured vintage cigars, and heavyweight architectural ashtrays."
                label="About Hero Subtitle"
                page="About Us"
                as="span"
              />
            </p>

            <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              <EditableText
                contentKey="about_hero_desc"
                defaultValue="CrossFaded was founded in Accra with a single standard: to purge cheap, generic, disposable smoke shop hardware from the market and replace it with precision industrial metalwork and timeless craftsmanship that looks stunning on any coffee table."
                label="About Hero Story Description"
                type="textarea"
                page="About Us"
                as="span"
              />
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-9 py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
              >
                <span>Shop The Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-7 py-4 bg-black/75 hover:bg-black/90 text-zinc-200 hover:text-white border border-zinc-700/80 font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all backdrop-blur-md"
              >
                <span>Browse Departments</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS BAR (Sleek Glassmorphic Luxury Metrics) */}
      {/* ========================================================================= */}
      <section className="w-full bg-zinc-950 border-y border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1.5 text-center sm:text-left">
                <p className="font-anton text-3xl sm:text-4xl text-amber-400 tracking-wide">
                  {stat.value}
                </p>
                <p className="font-aldrich text-xs sm:text-sm font-bold text-white">
                  {stat.label}
                </p>
                <p className="font-poppins text-[11px] text-zinc-400">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH FEATURE 1: HERB GRINDERS & CRUSHERS */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-black py-24 sm:py-32">
        {/* Dark Textured Metalcraft Backdrop */}
        <div className="absolute inset-0 overflow-hidden select-none">
          <img
            src="https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=3840&q=85"
            alt=""
            className="w-full h-full object-cover object-center opacity-20 scale-105 pointer-events-none"
          />
          {/* Ambient Warm Amber Glow */}
          <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />
          
          {/* High-Resolution Crusher Floating Graphic */}
          <div className="absolute -right-20 sm:-right-8 lg:right-6 xl:right-16 top-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] md:w-[600px] lg:w-[720px] xl:w-[840px] opacity-80 sm:opacity-90 lg:opacity-95 transform -rotate-6 z-10">
            <EditableImage
              contentKey="about_grinder_image"
              defaultValue="/images/crushers.jpeg"
              label="About Page Crusher Image"
              alt="Aerospace 6061 Crusher"
              page="About Us"
              className="w-full max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain rounded-3xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] filter contrast-110 brightness-100"
            />
          </div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 md:via-black/75 lg:via-black/55 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-6 sm:space-y-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <EditableText
                contentKey="about_grinder_badge"
                defaultValue="AEROSPACE 6061 ALLOY • CURVED DIAMOND TEETH"
                label="About Grinders Badge"
                page="About Us"
                as="span"
              />
            </div>

            <h2 className="font-anton text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
              <EditableText
                contentKey="about_grinder_title_prefix"
                defaultValue="ZERO METAL SHAVINGS."
                label="About Grinders Title Prefix"
                page="About Us"
                as="span"
              />{' '}
              <span className="text-amber-400 block sm:inline">
                <EditableText
                  contentKey="about_grinder_title_highlight"
                  defaultValue="100% PURE HERB."
                  label="About Grinders Title Highlight"
                  page="About Us"
                  as="span"
                />
              </span>
            </h2>

            <p className="font-aldrich text-base sm:text-xl font-semibold text-zinc-200 tracking-wide">
              <EditableText
                contentKey="about_grinder_subtitle"
                defaultValue="Surgically sharp diamond teeth built for fluffy, aerated consistency."
                label="About Grinders Subtitle"
                page="About Us"
                as="span"
              />
            </p>

            <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              <EditableText
                contentKey="about_grinder_desc"
                defaultValue="Traditional smoke shop grinders are made from cheap cast zinc alloys that chip toxic metallic residue into your herbs over time. CrossFaded crushers are CNC-machined from single-block aerospace 6061 aluminum with curved diamond-cut teeth that shear with zero friction, accompanied by a 100-micron stainless pollen filtration screen."
                label="About Grinders Description"
                type="textarea"
                page="About Us"
                as="span"
              />
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_grinder_pill_1"
                  defaultValue="63mm Aircraft 6061 Alloy"
                  label="About Grinders Pill 1"
                  page="About Us"
                  as="span"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_grinder_pill_2"
                  defaultValue="Curved Diamond Cutting Teeth"
                  label="About Grinders Pill 2"
                  page="About Us"
                  as="span"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_grinder_pill_3"
                  defaultValue="100-Micron Stainless Sifter"
                  label="About Grinders Pill 3"
                  page="About Us"
                  as="span"
                />
              </span>
            </div>

            <div className="pt-4">
              <Link
                to="/products-by-category?category=Herb%20Grinders"
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
              >
                <span>Shop Herb Grinders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FULL-WIDTH FEATURE 2: HUMIDOR-CURED CIGARS */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-black py-24 sm:py-32">
        {/* Dark Tobacco Leaf Texture Backdrop */}
        <div className="absolute inset-0 overflow-hidden select-none">
          <img
            src="https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?auto=format&fit=crop&w=3840&q=85"
            alt=""
            className="w-full h-full object-cover object-center opacity-25 scale-105 pointer-events-none"
          />
          {/* Ambient Warm Amber Glow */}
          <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />
          
          {/* High-Resolution Cigar Floating Graphic */}
          <div className="absolute -right-20 sm:-right-8 lg:right-6 xl:right-16 top-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] md:w-[620px] lg:w-[740px] xl:w-[860px] opacity-80 sm:opacity-90 lg:opacity-95 transform -rotate-12 z-10">
            <EditableImage
              contentKey="about_cigar_image"
              defaultValue="/images/cigar.png"
              label="About Page Cigar Image"
              alt="Hand-Rolled Cigar"
              page="About Us"
              className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] filter contrast-110 brightness-100"
            />
          </div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 md:via-black/75 lg:via-black/55 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-6 sm:space-y-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <EditableText
                contentKey="about_cigar_badge"
                defaultValue="HUMIDOR-CURED RESERVA • 100% HAND-ROLLED"
                label="About Cigars Badge"
                page="About Us"
                as="span"
              />
            </div>

            <h2 className="font-anton text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
              <EditableText
                contentKey="about_cigar_title_prefix"
                defaultValue="GET THE BEST"
                label="About Cigars Title Prefix"
                page="About Us"
                as="span"
              />{' '}
              <span className="text-amber-400 block sm:inline">
                <EditableText
                  contentKey="about_cigar_title_highlight"
                  defaultValue="CIGARS."
                  label="About Cigars Title Highlight"
                  page="About Us"
                  as="span"
                />
              </span>
            </h2>

            <p className="font-aldrich text-base sm:text-xl font-semibold text-zinc-200 tracking-wide">
              <EditableText
                contentKey="about_cigar_subtitle"
                defaultValue="Aged in Spanish cedar humidors for velvety draws & complex aromas."
                label="About Cigars Subtitle"
                page="About Us"
                as="span"
              />
            </p>

            <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              <EditableText
                contentKey="about_cigar_desc"
                defaultValue="Carefully cured Nicaraguan and Dominican tobacco leaves, hand-rolled with sun-grown Ecuadorian Habano wrappers. Stored strictly at 70% relative humidity in Spanish cedar cabinets to preserve essential oils — delivering notes of dark cocoa, roasted espresso, creamy cedar, and a delicate spice on the finish."
                label="About Cigars Description"
                type="textarea"
                page="About Us"
                as="span"
              />
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_cigar_pill_1"
                  defaultValue="54 Ring Gauge Grand Toro"
                  label="About Cigars Pill 1"
                  page="About Us"
                  as="span"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_cigar_pill_2"
                  defaultValue="5-Year Humidor Aged"
                  label="About Cigars Pill 2"
                  page="About Us"
                  as="span"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_cigar_pill_3"
                  defaultValue="Same-Day Discreet Accra Delivery"
                  label="About Cigars Pill 3"
                  page="About Us"
                  as="span"
                />
              </span>
            </div>

            <div className="pt-4">
              <Link
                to="/products-by-category?category=Cigars"
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
              >
                <span>Shop Cigars Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FULL-WIDTH FEATURE 3: HEAVYWEIGHT ASHTRAYS */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-black py-24 sm:py-32">
        {/* Dark Obsidian & Crystal Texture Backdrop */}
        <div className="absolute inset-0 overflow-hidden select-none">
          <img
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=3840&q=85"
            alt=""
            className="w-full h-full object-cover object-center opacity-20 scale-105 pointer-events-none"
          />
          {/* Ambient Warm Amber Glow */}
          <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />
          
          {/* High-Resolution Ashtray Floating Graphic */}
          <div className="absolute -right-20 sm:-right-8 lg:right-6 xl:right-16 top-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] md:w-[600px] lg:w-[720px] xl:w-[840px] opacity-80 sm:opacity-90 lg:opacity-95 transform -rotate-6 z-10">
            <EditableImage
              contentKey="about_ashtray_image"
              defaultValue="/images/ashtray.jpeg"
              label="About Page Ashtray Image"
              alt="Heavyweight Ashtray"
              page="About Us"
              className="w-full max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain rounded-3xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] filter contrast-110 brightness-100"
            />
          </div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 md:via-black/75 lg:via-black/55 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-6 sm:space-y-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              <EditableText
                contentKey="about_ashtray_badge"
                defaultValue="HEAVYWEIGHT CRYSTAL • HEAT-RESISTANT BASIN"
                label="About Ashtrays Badge"
                page="About Us"
                as="span"
              />
            </div>

            <h2 className="font-anton text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
              <EditableText
                contentKey="about_ashtray_title_prefix"
                defaultValue="GET THE BEST"
                label="About Ashtrays Title Prefix"
                page="About Us"
                as="span"
              />{' '}
              <span className="text-amber-400 block sm:inline">
                <EditableText
                  contentKey="about_ashtray_title_highlight"
                  defaultValue="ASHTRAYS."
                  label="About Ashtrays Title Highlight"
                  page="About Us"
                  as="span"
                />
              </span>
            </h2>

            <p className="font-aldrich text-base sm:text-xl font-semibold text-zinc-200 tracking-wide">
              <EditableText
                contentKey="about_ashtray_subtitle"
                defaultValue="Heavyweight architectural crystal and solid brass resting spots."
                label="About Ashtrays Subtitle"
                page="About Us"
                as="span"
              />
            </p>

            <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              <EditableText
                contentKey="about_ashtray_desc"
                defaultValue="Lightweight glass and tin trays flip over in patio breezes and scatter ash everywhere. CrossFaded ashtrays are crafted with 850g solid weighted bases, deep heat-dissipating chambers, and precision cigar rest grooves that remain firmly anchored on coastal Accra patios while looking like museum pieces."
                label="About Ashtrays Description"
                type="textarea"
                page="About Us"
                as="span"
              />
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_ashtray_pill_1"
                  defaultValue="Heavyweight Solid Base"
                  label="About Ashtrays Pill 1"
                  page="About Us"
                  as="span"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_ashtray_pill_2"
                  defaultValue="Precision Rest Grooves"
                  label="About Ashtrays Pill 2"
                  page="About Us"
                  as="span"
                />
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-poppins text-zinc-200 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <EditableText
                  contentKey="about_ashtray_pill_3"
                  defaultValue="Heat-Resistant Sealed Basin"
                  label="About Ashtrays Pill 3"
                  page="About Us"
                  as="span"
                />
              </span>
            </div>

            <div className="pt-4">
              <Link
                to="/products-by-category?category=Ashtrays"
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
              >
                <span>Shop Ashtrays Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. OUR 4 ACCRA EXCELLENCE STANDARDS (Card Grid Matching Store System) */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold block mb-2">
              <EditableText
                contentKey="about_standards_tag"
                defaultValue="THE CROSSFADED STANDARD"
                label="About Standards Tag"
                page="About Us"
                as="span"
              />
            </span>
            <h2 className="font-raleway text-3xl sm:text-5xl font-bold text-white tracking-tight">
              <EditableText
                contentKey="about_standards_title"
                defaultValue="Quality Above Everything"
                label="About Standards Title"
                page="About Us"
                as="span"
              />
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-zinc-400 mt-2">
              <EditableText
                contentKey="about_standards_subtitle"
                defaultValue="Every item dispatched from our Accra hub is held to strict mechanical and craftsmanship checks."
                label="About Standards Subtitle"
                page="About Us"
                as="span"
              />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {standards.map((std, idx) => {
              const Icon = std.icon;
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-b from-[#1c1c1c] to-[#131313] rounded-lg p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.08)] space-y-4 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-black text-amber-400 flex items-center justify-center shadow-inner">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-black/80 text-amber-400 font-bold">
                      {std.tag}
                    </span>
                  </div>

                  <h3 className="font-aldrich text-base font-bold text-white">
                    {std.title}
                  </h3>

                  <p className="font-poppins text-xs text-zinc-400 leading-relaxed">
                    {std.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FULL-WIDTH FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-black to-zinc-950 border-t border-zinc-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6">
          <HeartHandshake className="w-12 h-12 text-amber-400 mx-auto" />
          
          <h2 className="font-anton text-3xl sm:text-5xl text-white tracking-wide uppercase">
            <EditableText
              contentKey="about_cta_title"
              defaultValue="READY TO UPGRADE YOUR SESSION?"
              label="About Bottom CTA Title"
              page="About Us"
              as="span"
            />
          </h2>

          <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            <EditableText
              contentKey="about_cta_desc"
              defaultValue="Explore our curated catalog of precision 6061 crushers, aged Habano cigars, and heavy architectural crystal. Same-day express courier dispatch across Accra with Cash on Delivery and Mobile Money."
              label="About Bottom CTA Description"
              type="textarea"
              page="About Us"
              as="span"
            />
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-9 py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
            >
              <span>Explore The Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contactus"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black/75 hover:bg-black/90 text-zinc-200 hover:text-white border border-zinc-700/80 font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all backdrop-blur-md"
            >
              <span>Speak to Concierge</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
