import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Flame, Check } from 'lucide-react';
import { EditableText } from '../cms/EditableText';
import { EditableImage } from '../cms/EditableImage';

export const CigarFeature: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black py-12 sm:py-24 lg:py-32">
      
      {/* Background Layers: Cigar Visual & Ambient Lighting */}
      <div className="absolute inset-0 overflow-hidden select-none">
        {/* Subtle Dark Textured Tobacco Leaf Backdrop */}
        <img
          src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=3840&q=85"
          alt=""
          className="w-full h-full object-cover object-center opacity-20 scale-105 pointer-events-none"
        />

        {/* Ambient Warm Amber Glow behind the Cigar */}
        <div className="absolute right-[-10%] sm:right-[5%] lg:right-[12%] top-1/2 -translate-y-1/2 w-[380px] sm:w-[520px] lg:w-[680px] h-[380px] sm:h-[520px] lg:h-[680px] bg-amber-500/15 blur-[130px] rounded-full pointer-events-none" />

        {/* High-Resolution Cigar Background Graphic */}
        <div className="absolute -right-20 sm:-right-8 lg:right-6 xl:right-16 top-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] md:w-[620px] lg:w-[740px] xl:w-[860px] opacity-80 sm:opacity-90 lg:opacity-95 transform -rotate-12 z-10">
          <EditableImage
            contentKey="cigar_feature_image"
            defaultValue="/images/cigar.png"
            label="Home Cigar Feature Image"
            alt="Hand-Rolled Aged Cigar"
            page="Home"
            className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] filter contrast-110 brightness-100"
          />
        </div>

        {/* Contrast Gradients to keep left-hand text perfectly readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 md:via-black/75 lg:via-black/55 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Full-Width Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="max-w-2xl lg:max-w-2xl space-y-4 sm:space-y-6 text-left">
          
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <EditableText
              contentKey="cigar_feature_badge"
              defaultValue="HUMIDOR-CURED RESERVA • 100% HAND-ROLLED"
              label="Cigar Feature Badge"
              page="Home"
              as="span"
            />
          </div>

          {/* Main Headline */}
          <h2 className="font-anton text-3xl sm:text-5xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
            <EditableText
              contentKey="cigar_feature_title_prefix"
              defaultValue="GET THE BEST"
              label="Cigar Feature Title Prefix"
              page="Home"
              as="span"
            />{' '}
            <span className="text-amber-400 block sm:inline">
              <EditableText
                contentKey="cigar_feature_title_highlight"
                defaultValue="CIGARS."
                label="Cigar Feature Title Highlight"
                page="Home"
                as="span"
              />
            </span>
          </h2>

          {/* Sub-headline in Aldrich */}
          <p className="font-aldrich text-sm sm:text-lg lg:text-xl font-semibold text-zinc-200 tracking-wide">
            <EditableText
              contentKey="cigar_feature_subtitle"
              defaultValue="Aged in Spanish cedar humidors for velvety draws & complex aromas."
              label="Cigar Feature Subtitle"
              page="Home"
              as="span"
            />
          </p>

          {/* Description in Poppins */}
          <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
            <EditableText
              contentKey="cigar_feature_desc"
              defaultValue="Carefully cured Nicaraguan and Dominican tobacco leaves, hand-rolled with sun-grown Ecuadorian Habano wrappers. Delivering notes of dark cocoa, roasted espresso, creamy cedar, and a delicate spice on the finish."
              label="Cigar Feature Description"
              type="textarea"
              page="Home"
              as="span"
            />
          </p>

          {/* Key Feature Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-[11px] sm:text-xs font-poppins text-zinc-200 backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <EditableText
                contentKey="cigar_feature_pill_1"
                defaultValue="54 Ring Gauge Grand Toro"
                label="Cigar Feature Pill 1"
                page="Home"
                as="span"
              />
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-[11px] sm:text-xs font-poppins text-zinc-200 backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <EditableText
                contentKey="cigar_feature_pill_2"
                defaultValue="5-Year Humidor Aged"
                label="Cigar Feature Pill 2"
                page="Home"
                as="span"
              />
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-[11px] sm:text-xs font-poppins text-zinc-200 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <EditableText
                contentKey="cigar_feature_pill_3"
                defaultValue="Same-Day Discreet Accra Delivery"
                label="Cigar Feature Pill 3"
                page="Home"
                as="span"
              />
            </span>
          </div>

          {/* Call To Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
            <Link
              to="/products-by-category?category=Cigars"
              className="inline-flex items-center gap-2 px-6 sm:px-9 py-3 sm:py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
            >
              <span>Shop Cigars Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/products-by-category?category=Smoking%20Essentials"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-black/75 hover:bg-black/90 text-zinc-200 hover:text-white border border-zinc-700/80 font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all backdrop-blur-md"
            >
              <span>Cutters & Torch Lighters</span>
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
};
