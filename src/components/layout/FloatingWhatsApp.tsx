import React from 'react';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl = 'https://wa.me/233543236328?text=Hello%20CrossFaded!%20I%20have%20an%20inquiry.';

  return (
    <aside aria-label="Support chat" className="fixed bottom-6 left-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl shadow-[#25D366]/40 hover:shadow-[#25D366]/60 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 select-none group"
        aria-label="Chat on WhatsApp"
      >
        {/* Original WhatsApp Icon */}
        <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
          <img
            src="/images/whatsapp.png"
            alt="WhatsApp"
            className="w-full h-full object-contain drop-shadow"
          />
        </div>

        {/* Chat on WhatsApp text */}
        <span className="font-poppins font-bold text-xs sm:text-sm text-white tracking-wide whitespace-nowrap">
          Chat on WhatsApp
        </span>

        {/* Pulse Online Indicator */}
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      </a>
    </aside>
  );
};
