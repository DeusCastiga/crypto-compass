import { useState, useMemo, useEffect } from 'react';
import { 
  RefreshCw, Trash2, Clock, Bell, CheckCircle, History, 
  ArrowUpDown, Tag, Loader2, AlertTriangle 
} from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useCoinsById } from '@/hooks/useCoinGecko';
import { useApp } from '@/contexts/AppContext';
import { CoinCard } from '@/components/market/CoinCard';
import { CoinDetailModal } from '@/components/market/CoinDetailModal';
import { AlertForm } from '@/components/watchlist/AlertForm';
import { AlertList } from '@/components/watchlist/AlertList';
import { TagsNotesEditor } from '@/components/watchlist/TagsNotesEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Watchlist() {
  const { 
    watchlist, alerts, alertHistory, 
    removeFromWatchlist, clearAlertHistory, syncPrices, lastSync,
    triggerAlert 
  } = useWatchlist();
  const { formatPrice } = useApp();

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  const coinIds = watchlist.map(item => item.coinId);
  const { data: coinsData, isLoading, refetch, isFetching } = useCoinsById(coinIds);

  useEffect(() => {
    if (!coinsData || coinsData.length === 0) return;

    const checkAlerts = () => {
      alerts.forEach(alert => {
        if (alert.triggered) return;
        
        const coin = coinsData.find(c => c.id === alert.coinId);
        if (!coin) return;

        let shouldTrigger = false;
        
        if (alert.type === 'price') {
          if (alert.direction === 'above' && coin.current_price >= alert.targetValue) {
            shouldTrigger = true;
          } else if (alert.direction === 'below' && coin.current_price <= alert.targetValue) {
            shouldTrigger = true;
          }
        } else {
          const change = alert.window === '24h' 
            ? coin.price_change_percentage_24h 
            : (coin.price_change_percentage_7d_in_currency ?? 0);
          
          if (alert.direction === 'above' && change >= alert.targetValue) {
            shouldTrigger = true;
          } else if (alert.direction === 'below' && change <= -alert.targetValue) {
            shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          triggerAlert(alert.id, coin.current_price);
        }
      });
    };

    checkAlerts();
    const interval = setInterval(() => {
      refetch().then(checkAlerts);
    }, 60000);

    return () => clearInterval(interval);
  }, [alerts, coinsData, triggerAlert, refetch]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const watchlistWithData = useMemo(() => {
    if (!coinsData) return [];
    
    return watchlist.map(item => {
      const coinData = coinsData.find(c => c.id === item.coinId);
      return { ...item, coinData };
    }).filter(item => item.coinData);
  }, [watchlist, coinsData]);

  const sortedWatchlist = useMemo(() => {
    return [...watchlistWithData].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'market_cap':
          return (b.coinData?.market_cap ?? 0) - (a.coinData?.market_cap ?? 0);
        case 'price':
          return (b.coinData?.current_price ?? 0) - (a.coinData?.current_price ?? 0);
        case 'change_24h':
          return (b.coinData?.price_change_percentage_24h ?? 0) - (a.coinData?.price_change_percentage_24h ?? 0);
        default:
          return 0;
      }
    });
  }, [watchlistWithData, sortBy]);

  const triggeredLast24h = alerts.filter(a => {
    if (!a.triggeredAt) return false;
    const triggeredDate = new Date(a.triggeredAt);
    const now = new Date();
    return (now.getTime() - triggeredDate.getTime()) < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="min-h-screen pt-32 md:pt-24 pb-12">
      <div className="gradient-watchlist py-16 mb-8 -mt-24 pt-32 md:pt-40">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
            Watchlist & Alerts
          </h1>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary-foreground" />
              <span className="text-secondary-foreground font-medium">{triggeredLast24h} alerts triggered (24h)</span>
            </div>
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <History className="w-5 h-5 text-secondary-foreground" />
              <span className="text-secondary-foreground font-medium">{alertHistory.length} in history</span>
            </div>
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary-foreground" />
              <span className="text-secondary-foreground font-medium">
                Last sync: {lastSync ? format(lastSync, 'HH:mm:ss') : 'Never'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => { refetch(); syncPrices(); }}
              disabled={isFetching}
              className="bg-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/30 border-0"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
              Sync Prices
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={clearAlertHistory}
              className="bg-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/30 border-0"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                My Watchlist ({watchlist.length})
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 glass border-0">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="market_cap">Market Cap</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="change_24h">Change 24h</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && coinIds.length > 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            )}

            {watchlist.length === 0 && (
              <div className="glass-card text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Your watchlist is empty</p>
                <p className="text-sm text-muted-foreground">Add coins from the Market page to get started</p>
              </div>
            )}

            {!isLoading && sortedWatchlist.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedWatchlist.map((item) => (
                  <CoinCard
                    key={item.coinId}
                    coin={item.coinData}
                    onViewDetails={setSelectedCoin}
                    tags={item.tags}
                    note={item.note}
                    showActions={true}
                  />
                ))}
              </div>
            )}

            {watchlist.length > 0 && (
              <div className="glass-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags & Notes
                </h3>
                <div className="space-y-2">
                  {watchlist.map((item) => (
                    <TagsNotesEditor key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Price Alerts
                </h3>
                <AlertForm watchlistItems={watchlist} />
              </div>
              <AlertList alerts={alerts} />
            </div>

            <div className="glass-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Alert History
              </h3>
              
              {alertHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No history yet</p>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {alertHistory.map((entry) => (
                      <div key={entry.id} className="p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground uppercase">{entry.coinSymbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(entry.triggeredAt), 'dd/MM HH:mm')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.direction === 'above' ? '↑' : '↓'} {' '}
                          {entry.type === 'price' 
                            ? `Price: ${formatPrice(entry.triggeredPrice)}`
                            : `${entry.targetValue}% change`
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </div>

      <CoinDetailModal
        coin={selectedCoin}
        open={!!selectedCoin}
        onClose={() => setSelectedCoin(null)}
      />
    </div>
  );
}
