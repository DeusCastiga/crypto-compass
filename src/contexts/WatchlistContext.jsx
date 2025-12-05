import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const WatchlistContext = createContext(undefined);

const STORAGE_KEYS = {
  watchlist: 'cryptowatch-watchlist',
  alerts: 'cryptowatch-alerts',
  alertHistory: 'cryptowatch-alert-history',
  pinnedCoins: 'cryptowatch-pinned',
};

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.watchlist);
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.alerts);
    return saved ? JSON.parse(saved) : [];
  });

  const [alertHistory, setAlertHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.alertHistory);
    return saved ? JSON.parse(saved) : [];
  });

  const [pinnedCoins, setPinnedCoins] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.pinnedCoins);
    return saved ? JSON.parse(saved) : [];
  });

  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.alertHistory, JSON.stringify(alertHistory));
  }, [alertHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.pinnedCoins, JSON.stringify(pinnedCoins));
  }, [pinnedCoins]);

  const addToWatchlist = useCallback((coin) => {
    if (watchlist.some(item => item.coinId === coin.id)) {
      toast.info(`${coin.name} is already in your watchlist`);
      return;
    }
    
    const newItem = {
      id: crypto.randomUUID(),
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      addedAt: new Date().toISOString(),
      tags: [],
      note: '',
    };
    
    setWatchlist(prev => [...prev, newItem]);
    toast.success(`${coin.name} added to watchlist`);
  }, [watchlist]);

  const removeFromWatchlist = useCallback((coinId) => {
    setWatchlist(prev => prev.filter(item => item.coinId !== coinId));
    setAlerts(prev => prev.filter(alert => alert.coinId !== coinId));
    toast.success('Removed from watchlist');
  }, []);

  const isInWatchlist = useCallback((coinId) => {
    return watchlist.some(item => item.coinId === coinId);
  }, [watchlist]);

  const updateWatchlistItem = useCallback((coinId, updates) => {
    setWatchlist(prev => prev.map(item => 
      item.coinId === coinId ? { ...item, ...updates } : item
    ));
    toast.success('Watchlist item updated');
  }, []);

  const createAlert = useCallback((alert) => {
    const newAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts(prev => [...prev, newAlert]);
    toast.success('Alert created');
  }, []);

  const deleteAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert deleted');
  }, []);

  const updateAlert = useCallback((alertId, updates) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, ...updates } : alert
    ));
  }, []);

  const triggerAlert = useCallback((alertId, triggeredPrice) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert || alert.triggered) return;

    const historyEntry = {
      id: crypto.randomUUID(),
      alertId,
      coinName: alert.coinName,
      coinSymbol: alert.coinSymbol,
      type: alert.type,
      direction: alert.direction,
      targetValue: alert.targetValue,
      triggeredAt: new Date().toISOString(),
      triggeredPrice,
    };

    setAlertHistory(prev => [historyEntry, ...prev]);
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, triggered: true, triggeredAt: new Date().toISOString(), triggeredPrice } : a
    ));

    if (Notification.permission === 'granted') {
      new Notification(`CryptoWatch Alert: ${alert.coinName}`, {
        body: `${alert.direction === 'above' ? '↑' : '↓'} ${alert.type === 'price' ? `Price reached ${triggeredPrice}` : `Change of ${alert.targetValue}%`}`,
        icon: '/favicon.ico',
      });
    }

    toast.success(`Alert triggered: ${alert.coinName} ${alert.direction} target!`);
  }, [alerts]);

  const clearAlertHistory = useCallback(() => {
    setAlertHistory([]);
    toast.success('Alert history cleared');
  }, []);

  const togglePin = useCallback((coinId) => {
    setPinnedCoins(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  }, []);

  const isPinned = useCallback((coinId) => {
    return pinnedCoins.includes(coinId);
  }, [pinnedCoins]);

  const syncPrices = useCallback(() => {
    setLastSync(new Date());
    toast.success('Prices synchronized');
  }, []);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      alerts,
      alertHistory,
      pinnedCoins,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      updateWatchlistItem,
      createAlert,
      deleteAlert,
      updateAlert,
      triggerAlert,
      clearAlertHistory,
      togglePin,
      isPinned,
      syncPrices,
      lastSync,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
}
