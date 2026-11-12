import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';

const AGE_VERIFIED_KEY = 'crossfaded_age_verified';

export const AgeVerificationModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const verified = localStorage.getItem(AGE_VERIFIED_KEY);
      if (!verified) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(false);
    }
  }, []);

  const handleVerify = () => {
    try {
      localStorage.setItem(AGE_VERIFIED_KEY, 'true');
    } catch {}
    setIsOpen(false);
  };

  const handleUnderage = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-zinc-950 border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center z-10 overflow-hidden"
        >
          {/* Top Gold Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Logo & Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="font-anton text-3xl tracking-wider text-amber-400 block mb-1">
            CROSSFADED
          </span>
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-6">
            The Ultimate Vibe Store
          </p>

          <h2 className="font-raleway text-xl font-bold text-white mb-3">
            Age Verification Notice
          </h2>

          <p className="font-poppins text-xs text-zinc-400 leading-relaxed mb-8">
            This website showcases precision smoking accessories and fine cigars. You must be at least <span className="text-amber-400 font-bold">21 years of age</span> (or legal smoking age in your jurisdiction) to enter.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleVerify}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-95"
            >
              I am 21 or older • Enter
            </button>

            <button
              onClick={handleUnderage}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition-colors"
            >
              I am under 21 • Exit
            </button>
          </div>

          <p className="text-[10px] text-zinc-600 mt-6 font-poppins">
            By entering, you confirm you are of legal age and agree to our Terms of Service.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

