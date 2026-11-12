import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  ShoppingBag,
  Flame,
  Zap,
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export const HeroSlider: React.FC = () => {
  const { sliders } = useProducts();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedItem, setAddedItem] = useState(false);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  // Auto-slide timer
  useEffect(() => {
    if (isPaused || sliders.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % sliders.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, sliders.length]);

  if (!sliders.length) return null;

  const current = sliders[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  };

  const handleQuickAdd = async (e: React.MouseEvent, prod: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!prod) return;
    setAddedItem(true);
    await addToCart(
      {
        id: prod.link ? prod.link.replace('/product/', '') : 'prod-1',
        productId: prod.link ? prod.link.replace('/product/', '') : 'prod-1',
        name: prod.name,
        price: prod.price,
        imageUrls: [prod.image],
        categoryId: 'featured',
        categoryName: 'Featured',
        stock: 20,
        description: prod.specs,
      },
      1
    );
    setTimeout(() => setAddedItem(false), 1200);
  };

  return (
    <section
      className="relative w-full h-[520px] sm:h-[640px] lg:h-[720px] bg-black overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 4K Background Image Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.title || 'CrossFaded Banner'}
            className="w-full h-full object-cover object-center"
          />

          {/* Luxury contrast scrims: Left darkened for text readability, Bottom & Top darkened to blend with header */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/25 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Main Full-Width Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex flex-col justify-center py-6 sm:py-12">
        
        {/* Center Grid: Left Text Block & Right Interactive Spotlight Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Hero Typography & Value Props (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Badge Chip */}
                {current.badge && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-poppins font-semibold text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{current.badge}</span>
                  </div>
                )}

                {/* Anton Headline with Amber Highlight */}
                <h1 className="font-anton text-3xl sm:text-5xl lg:text-7xl font-bold tracking-wide text-white uppercase leading-[1.05]">
                  {current.title || 'THE ULTIMATE'}{' '}
                  <span className="text-amber-400 block sm:inline">
                    {current.highlight || 'VIBE STORE.'}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="font-poppins text-xs sm:text-sm lg:text-base text-zinc-300 max-w-xl leading-relaxed">
                  {current.subtitle ||
                    'Good Treats, Better Vibes. Discover precision smoking accessories engineered for luxury sessions in Ghana.'}
                </p>

                {/* Features Pills Row */}
                {current.features && current.features.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
                    {current.features.map((feat, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-black/60 border border-zinc-800 text-[10px] sm:text-[11px] font-poppins text-zinc-300 backdrop-blur-sm"
                      >
                        <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
                  <Link
                    to={current.primaryCtaLink || current.link || '/shop'}
                    className="inline-flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 active:scale-95"
                  >
                    <span>{current.primaryCtaText || 'Shop The Collection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={current.secondaryCtaLink || '/shop'}
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-black/50 hover:bg-black/75 text-zinc-200 hover:text-white border border-zinc-700/80 font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all backdrop-blur-md"
                  >
                    <span>{current.secondaryCtaText || 'View Bestsellers'}</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Interactive Spotlight Product Widget (5 Cols) */}
          <div className="lg:col-span-5 hidden sm:block">
            <AnimatePresence mode="wait">
              {current.featuredProduct && (
                <motion.div
                  key={`widget-${currentIndex}`}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-[#181818]/95 border border-zinc-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4 hover:border-amber-400/60 transition-all max-w-sm ml-auto"
                >
                  {/* Card Header Widget */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {current.featuredProduct.tag || 'Spotlight Hardware'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      In Stock
                    </span>
                  </div>

                  {/* Thumbnail & Info Row */}
                  <div className="flex items-center gap-4">
                    <Link
                      to={current.featuredProduct.link || '/shop'}
                      className="w-20 h-20 rounded-xl bg-black border border-zinc-800 p-2 shrink-0 flex items-center justify-center group overflow-hidden"
                    >
                      <img
                        src={current.featuredProduct.image}
                        alt={current.featuredProduct.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={current.featuredProduct.link || '/shop'}
                        className="block font-aldrich text-sm font-bold text-white hover:text-amber-400 transition-colors truncate"
                      >
                        {current.featuredProduct.name}
                      </Link>
                      <p className="text-[11px] text-zinc-400 font-poppins mt-0.5 line-clamp-1">
                        {current.featuredProduct.specs}
                      </p>

                      {/* Stars & Reviews */}
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-400">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-zinc-400 text-[11px] font-mono">
                          {current.featuredProduct.rating} ({current.featuredProduct.reviewsCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Widget Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-poppins block">
                        Special Price
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-aldrich text-lg font-bold text-amber-400">
                          {formatPrice(current.featuredProduct.price)}
                        </span>
                        {current.featuredProduct.originalPrice && (
                          <span className="text-xs text-zinc-500 line-through font-aldrich">
                            {formatPrice(current.featuredProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleQuickAdd(e, current.featuredProduct)}
                        className={`px-3.5 py-2 rounded text-xs font-poppins font-semibold flex items-center gap-1.5 transition-all shadow ${
                          addedItem
                            ? 'bg-emerald-500 text-black'
                            : 'bg-amber-400 hover:bg-amber-300 text-black active:scale-95'
                        }`}
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{addedItem ? 'Added!' : 'Add to Bag'}</span>
                      </button>

                      <Link
                        to={current.featuredProduct.link || '/shop'}
                        className="px-3 py-2 rounded bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700 text-xs font-poppins transition-colors"
                        title="View details"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Minimal Clean Dot Indicators */}
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
          {sliders.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-4 h-1 sm:w-5 sm:h-1 bg-amber-400 shadow-sm shadow-amber-400/40'
                  : 'w-1.5 h-1 sm:w-1.5 sm:h-1 bg-white/30 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Floating Side Arrow Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-amber-400 text-white hover:text-black border border-zinc-700/80 flex items-center justify-center transition-all shadow-xl active:scale-90"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-amber-400 text-white hover:text-black border border-zinc-700/80 flex items-center justify-center transition-all shadow-xl active:scale-90"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </section>
  );
};
