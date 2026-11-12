import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, Check, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export const VibeBanner: React.FC = () => {
  const { categorySliders } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance loop every 5.5s - continuous, does NOT pause on mouse hover
  useEffect(() => {
    if (!categorySliders || categorySliders.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categorySliders.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [categorySliders]);

  if (!categorySliders || categorySliders.length === 0) return null;

  // Safe fallback index
  const safeIndex = currentIndex % categorySliders.length;
  const current = categorySliders[safeIndex];

  return (
    <section className="relative w-full overflow-hidden bg-black py-12 sm:py-24 lg:py-32 select-none">
      
      {/* Background Animated Visual Layers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || safeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none overflow-hidden select-none"
        >
          {/* Subtle Dark Atmospheric Texture */}
          <img
            src={
              current.backgroundImage ||
              'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=3840&q=85'
            }
            alt=""
            className="w-full h-full object-cover object-center opacity-20 scale-105 transition-transform duration-1000"
          />

          {/* Ambient Warm Amber Glow */}
          <div className="absolute right-[-10%] sm:right-[5%] lg:right-[12%] top-1/2 -translate-y-1/2 w-[380px] sm:w-[520px] lg:w-[680px] h-[380px] sm:h-[520px] lg:h-[680px] bg-amber-500/15 blur-[130px] rounded-full" />

          {/* High-Resolution Product Background Graphic */}
          <div className="absolute -right-20 sm:-right-8 lg:right-6 xl:right-16 top-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] md:w-[600px] lg:w-[720px] xl:w-[840px] opacity-80 sm:opacity-90 lg:opacity-95 transform -rotate-6 pointer-events-none">
            <img
              src={current.productImage}
              alt={current.category}
              className="w-full max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain rounded-3xl drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] filter contrast-110 brightness-100"
            />
          </div>

          {/* Contrast Gradients for Flawless Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 md:via-black/75 lg:via-black/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
        </motion.div>
      </AnimatePresence>

      {/* Foreground Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || safeIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl lg:max-w-2xl space-y-4 sm:space-y-6 text-left"
          >
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{current.tag || 'PREMIUM ACCESSORIES GH'}</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-anton text-3xl sm:text-5xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
              {current.title || 'GET THE BEST'}{' '}
              <span className="text-amber-400 block sm:inline">
                {current.highlight || `${current.category.toUpperCase()}.`}
              </span>
            </h2>

            {/* Sub-headline in Aldrich */}
            <p className="font-aldrich text-sm sm:text-lg lg:text-xl font-semibold text-zinc-200 tracking-wide">
              {current.subtitle}
            </p>

            {/* Description in Poppins */}
            <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              {current.description}
            </p>

            {/* Key Feature Pills */}
            {current.features && current.features.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
                {current.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-black/80 border border-zinc-800 text-[11px] sm:text-xs font-poppins text-zinc-200 backdrop-blur-sm"
                  >
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Call To Action Buttons (leading to exact category) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
              <Link
                to={current.categoryLink}
                className="inline-flex items-center gap-2 px-6 sm:px-9 py-3 sm:py-4 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded transition-all shadow-xl shadow-amber-500/25 active:scale-95"
              >
                <span>{current.buttonText || `Shop ${current.category}`}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {current.secondaryLink && (
                <Link
                  to={current.secondaryLink}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-black/75 hover:bg-black/90 text-zinc-200 hover:text-white border border-zinc-700/80 font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all backdrop-blur-md"
                >
                  <span>{current.secondaryText || 'Explore Models'}</span>
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
};
