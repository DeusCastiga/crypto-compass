import { useMemo } from 'react';
import { 
  Bookmark, Bell, TrendingUp, TrendingDown, 
  Globe, BarChart3, PieChart, Loader2, AlertTriangle 
} from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useCoinsById, useGlobalData } from '@/hooks/useCoinGecko';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertDistributionChart } from '@/components/dashboard/AlertDistributionChart';
import { AlertPieChart } from '@/components/dashboard/AlertPieChart';
import { Sparkline } from '@/components/ui/Sparkline';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { watchlist, alerts, alertHistory } = useWatchlist();
  const { formatPrice, formatNumber, formatPercent, currency } = useApp();
  
  const coinIds = watchlist.map(item => item.coinId);
  const { data: coinsData, isLoading: coinsLoading } = useCoinsById(coinIds);
  const { data: globalData, isLoading: globalLoading } = useGlobalData();

  const isLoading = coinsLoading || globalLoading;

  // Calculate stats
  const stats = useMemo(() => {
    if (!coinsData || coinsData.length === 0) {
      return {
        highestMarketCap: null,
        avgChange24h: 0,
        triggeredLast24h: 0,
      };
    }

    const highestMarketCap = coinsData.reduce((prev, curr) => 
      curr.market_cap > prev.market_cap ? curr : prev
    );

    const avgChange24h = coinsData.reduce((sum, coin) => 
      sum + coin.price_change_percentage_24h, 0
    ) / coinsData.length;

    const triggeredLast24h = alerts.filter(a => {
      if (!a.triggeredAt) return false;
      const triggeredDate = new Date(a.triggeredAt);
      const now = new Date();
      return (now.getTime() - triggeredDate.getTime()) < 24 * 60 * 60 * 1000;
    }).length;

    return { highestMarketCap, avgChange24h, triggeredLast24h };
  }, [coinsData, alerts]);

  const btcDominance = globalData?.data?.market_cap_percentage?.btc ?? 0;
  const totalVolume24h = globalData?.data?.total_volume?.[currency] ?? 0;

  return (
    <div className="min-h-screen pt-32 md:pt-24 pb-12">
      {/* Hero */}
      <div className="gradient-dashboard py-16 mb-8 -mt-24 pt-32 md:pt-40">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Dashboard
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Overview of your crypto portfolio and alerts
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Watchlist Items"
                value={watchlist.length}
                subtitle="coins tracked"
                icon={Bookmark}
              />
              <StatCard
                title="Active Alerts"
                value={alerts.filter(a => !a.triggered).length}
                subtitle={`${stats.triggeredLast24h} triggered (24h)`}
                icon={Bell}
                trend={stats.triggeredLast24h > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                title="BTC Dominance"
                value={`${btcDominance.toFixed(1)}%`}
                subtitle="market share"
                icon={Globe}
              />
              <StatCard
                title="Global Volume 24h"
                value={formatNumber(totalVolume24h)}
                icon={BarChart3}
              />
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {stats.highestMarketCap && (
                <StatCard
                  title="Top by Market Cap"
                  value={stats.highestMarketCap.name}
                  subtitle={formatNumber(stats.highestMarketCap.market_cap)}
                  icon={TrendingUp}
                />
              )}
              <StatCard
                title="Avg. Change 24h"
                value={formatPercent(stats.avgChange24h)}
                subtitle="across watchlist"
                icon={stats.avgChange24h >= 0 ? TrendingUp : TrendingDown}
                trend={stats.avgChange24h >= 0 ? 'up' : 'down'}
              />
              <StatCard
                title="Total Alerts"
                value={alerts.length}
                subtitle={`${alertHistory.length} in history`}
                icon={Bell}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AlertDistributionChart alerts={alerts} />
              <AlertPieChart alerts={alerts} />
            </div>

            {/* Watchlist Summary */}
            <div className="glass-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Watchlist Summary
              </h3>
              
              {(!coinsData || coinsData.length === 0) ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Add coins to your watchlist to see data here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                        <th className="pb-3">Coin</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">24h Change</th>
                        <th className="pb-3">7d Chart</th>
                        <th className="pb-3">Market Cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coinsData.slice(0, 10).map((coin) => (
                        <tr key={coin.id} className="border-b border-border/30 last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                              <div>
                                <span className="font-medium text-foreground">{coin.name}</span>
                                <span className="text-muted-foreground text-sm ml-2 uppercase">{coin.symbol}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-medium text-foreground">
                            {formatPrice(coin.current_price)}
                          </td>
                          <td className="py-4">
                            <Badge 
                              variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                              className={cn(
                                "font-medium",
                                coin.price_change_percentage_24h >= 0 
                                  ? "bg-success/20 text-success" 
                                  : "bg-destructive/20 text-destructive"
                              )}
                            >
                              {formatPercent(coin.price_change_percentage_24h)}
                            </Badge>
                          </td>
                          <td className="py-4">
                            {coin.sparkline_in_7d?.price && (
                              <Sparkline data={coin.sparkline_in_7d.price} width={80} height={24} />
                            )}
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {formatNumber(coin.market_cap)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
