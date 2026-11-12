import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'GHS' | 'USD' | 'GBP' | 'EUR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceInGHS: number) => string;
  rates: Record<CurrencyCode, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates relative to 1 GHS
const RATES: Record<CurrencyCode, number> = {
  GHS: 1,
  USD: 0.065, // ~15.4 GHS per USD
  GBP: 0.051, // ~19.6 GHS per GBP
  EUR: 0.060, // ~16.7 GHS per EUR
};

const SYMBOLS: Record<CurrencyCode, string> = {
  GHS: 'GHS',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      return (localStorage.getItem('crossfaded_currency') as CurrencyCode) || 'GHS';
    } catch {
      return 'GHS';
    }
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('crossfaded_currency', c);
    } catch {}
  };

  const formatPrice = (priceInGHS: number): string => {
    const rate = RATES[currency] || 1;
    const converted = priceInGHS * rate;
    const symbol = SYMBOLS[currency] || 'GHS';

    if (currency === 'GHS') {
      return `GHS ${priceInGHS.toFixed(2)}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        rates: RATES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};

