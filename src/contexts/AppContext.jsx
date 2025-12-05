import React, { createContext, useContext, useState, useEffect } from 'react';

const currencySymbols = {
  usd: '$',
  eur: '€',
  brl: 'R$',
};

const currencyLocales = {
  usd: 'en-US',
  eur: 'de-DE',
  brl: 'pt-BR',
};

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('cryptowatch-currency');
    return saved || 'usd';
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cryptowatch-theme');
    if (saved) return saved;
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPercent = (percent) => {
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
