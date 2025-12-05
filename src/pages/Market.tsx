import { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useMarketData, CoinMarket } from '@/hooks/useCoinGecko';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { CoinCard } from '@/components/market/CoinCard';
import { CoinDetailModal } from '@/components/market/CoinDetailModal';
import { CompareBlock } from '@/components/market/CompareBlock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'top10' | 'gainers' | 'losers' | 'pinned';

export default function Market() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [autoLoad, setAutoLoad] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinMarket | null>(null);
  const [compareCoins, setCompareCoins] = useState<CoinMarket[]>([]);

  const { data: coins, isLoading, isFetching, refetch } = useMarketData(page, 50);
  const { pinnedCoins } = useWatchlist();

  // Filter and search
  const filteredCoins = useMemo(() => {
    if (!coins) return [];
    
    let result = [...coins];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(coin => 
        coin.name.toLowerCase().includes(searchLower) ||
        coin.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    switch (filter) {
      case 'top10':
        result = result.filter(coin => coin.market_cap_rank <= 10);
        break;
      case 'gainers':
        result = result.filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        break;
      case 'losers':
        result = result.filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        break;
      case 'pinned':
        result = result.filter(coin => pinnedCoins.includes(coin.id));
        break;
    }

    // Always show pinned at top
    if (filter !== 'pinned') {
      const pinned = result.filter(coin => pinnedCoins.includes(coin.id));
      const notPinned = result.filter(coin => !pinnedCoins.includes(coin.id));
      result = [...pinned, ...notPinned];
    }

    return result.slice(0, 20);
  }, [coins, search, filter, pinnedCoins]);

  const handleCompare = (coin: CoinMarket) => {
    if (compareCoins.find(c => c.id === coin.id)) {
      setCompareCoins(prev => prev.filter(c => c.id !== coin.id));
    } else if (compareCoins.length < 3) {
      setCompareCoins(prev => [...prev, coin]);
    }
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'top10', label: 'Top 10' },
    { key: 'gainers', label: 'Gainers 24h' },
    { key: 'losers', label: 'Losers 24h' },
    { key: 'pinned', label: 'Pinned' },
  ];

  return (
    <div className="min-h-screen pt-32 md:pt-24 pb-12">
      {/* Hero */}
      <div className="gradient-market py-16 mb-8 -mt-24 pt-32 md:pt-40">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Cryptocurrency Market
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Track real-time prices, market caps, and trends for thousands of cryptocurrencies
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Search & Filters */}
        <div className="glass-card mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 glass border-0"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    filter === f.key && "gradient-market border-0"
                  )}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="auto-load" checked={autoLoad} onCheckedChange={setAutoLoad} />
                <Label htmlFor="auto-load" className="text-sm text-muted-foreground">Auto-load more</Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>

        {/* Compare Block */}
        <CompareBlock 
          coins={compareCoins} 
          onRemove={(id) => setCompareCoins(prev => prev.filter(c => c.id !== id))}
          onClear={() => setCompareCoins([])}
        />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Coins Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCoins.map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                onViewDetails={setSelectedCoin}
                onCompare={handleCompare}
                isComparing={compareCoins.some(c => c.id === coin.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCoins.length === 0 && (
          <div className="glass-card text-center py-12">
            <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No coins found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <CoinDetailModal
        coin={selectedCoin}
        open={!!selectedCoin}
        onClose={() => setSelectedCoin(null)}
      />
    </div>
  );
}
