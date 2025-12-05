import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'usd' | 'eur' | 'brl';
type Theme = 'light' | 'dark';

interface AppContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme: Theme;
  toggleTheme: () => void;
  formatPrice: (price: number) => string;
  formatNumber: (num: number) => string;
  formatPercent: (percent: number) => string;
}

const currencySymbols: Record<Currency, string> = {
  usd: '$',
  eur: '€',
  brl: 'R$',
};

const currencyLocales: Record<Currency, string> = {
  usd: 'en-US',
  eur: 'de-DE',
  brl: 'pt-BR',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('cryptowatch-currency');
    return (saved as Currency) || 'usd';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cryptowatch-theme');
    if (saved) return saved as Theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('cryptowatch-currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('cryptowatch-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <AppContext.Provider value={{
      currency,
      setCurrency,
      theme,
      toggleTheme,
      formatPrice,
      formatNumber,
      formatPercent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
