import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

export interface WatchlistItem {
  id: string;
  coinId: string;
  name: string;
  symbol: string;
  image: string;
  addedAt: string;
  tags: string[];
  note: string;
}

export interface Alert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  type: 'price' | 'percent';
  direction: 'above' | 'below';
  targetValue: number;
  window: '24h' | '7d';
  note: string;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  coinName: string;
  coinSymbol: string;
  type: 'price' | 'percent';
  direction: 'above' | 'below';
  targetValue: number;
  triggeredAt: string;
  triggeredPrice: number;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  alerts: Alert[];
  alertHistory: AlertHistory[];
  pinnedCoins: string[];
  addToWatchlist: (coin: { id: string; name: string; symbol: string; image: string }) => void;
  removeFromWatchlist: (coinId: string) => void;
  isInWatchlist: (coinId: string) => boolean;
  updateWatchlistItem: (coinId: string, updates: { tags?: string[]; note?: string }) => void;
  createAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => void;
  deleteAlert: (alertId: string) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  triggerAlert: (alertId: string, triggeredPrice: number) => void;
  clearAlertHistory: () => void;
  togglePin: (coinId: string) => void;
  isPinned: (coinId: string) => boolean;
  syncPrices: () => void;
  lastSync: Date | null;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const STORAGE_KEYS = {
  watchlist: 'cryptowatch-watchlist',
  alerts: 'cryptowatch-alerts',
  alertHistory: 'cryptowatch-alert-history',
  pinnedCoins: 'cryptowatch-pinned',
};

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.watchlist);
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.alerts);
    return saved ? JSON.parse(saved) : [];
  });

  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.alertHistory);
    return saved ? JSON.parse(saved) : [];
  });

  const [pinnedCoins, setPinnedCoins] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.pinnedCoins);
    return saved ? JSON.parse(saved) : [];
  });

  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Save to localStorage
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

  const addToWatchlist = useCallback((coin: { id: string; name: string; symbol: string; image: string }) => {
    if (watchlist.some(item => item.coinId === coin.id)) {
      toast.info(`${coin.name} is already in your watchlist`);
      return;
    }
    
    const newItem: WatchlistItem = {
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

  const removeFromWatchlist = useCallback((coinId: string) => {
    setWatchlist(prev => prev.filter(item => item.coinId !== coinId));
    setAlerts(prev => prev.filter(alert => alert.coinId !== coinId));
    toast.success('Removed from watchlist');
  }, []);

  const isInWatchlist = useCallback((coinId: string) => {
    return watchlist.some(item => item.coinId === coinId);
  }, [watchlist]);

  const updateWatchlistItem = useCallback((coinId: string, updates: { tags?: string[]; note?: string }) => {
    setWatchlist(prev => prev.map(item => 
      item.coinId === coinId ? { ...item, ...updates } : item
    ));
    toast.success('Watchlist item updated');
  }, []);

  const createAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    setAlerts(prev => [...prev, newAlert]);
    toast.success('Alert created');
  }, []);

  const deleteAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert deleted');
  }, []);

  const updateAlert = useCallback((alertId: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, ...updates } : alert
    ));
  }, []);

  const triggerAlert = useCallback((alertId: string, triggeredPrice: number) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert || alert.triggered) return;

    const historyEntry: AlertHistory = {
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

    // Browser notification
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

  const togglePin = useCallback((coinId: string) => {
    setPinnedCoins(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  }, []);

  const isPinned = useCallback((coinId: string) => {
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
