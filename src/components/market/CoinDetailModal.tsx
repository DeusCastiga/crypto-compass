import { X, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { CoinMarket, useCoinDetail } from '@/hooks/useCoinGecko';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CoinDetailModalProps {
  coin: CoinMarket | null;
  open: boolean;
  onClose: () => void;
}

export function CoinDetailModal({ coin, open, onClose }: CoinDetailModalProps) {
  const { formatPrice, formatNumber, formatPercent, currency } = useApp();
  const { data: detail, isLoading } = useCoinDetail(coin?.id ?? null);

  if (!coin) return null;

  const priceUp = coin.price_change_percentage_24h >= 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
            <div>
              <span className="text-xl">{coin.name}</span>
              <span className="text-muted-foreground text-sm ml-2 uppercase">{coin.symbol}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Price */}
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatPrice(coin.current_price)}
              </div>
              <Badge 
                variant={priceUp ? "default" : "destructive"}
                className={cn(
                  "text-sm px-3 py-1",
                  priceUp ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                )}
              >
                {priceUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {formatPercent(coin.price_change_percentage_24h)} (24h)
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">High 24h</span>
                </div>
                <div className="font-semibold text-foreground">
                  {formatPrice(coin.high_24h)}
                </div>
              </div>
              
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">Low 24h</span>
                </div>
                <div className="font-semibold text-foreground">
                  {formatPrice(coin.low_24h)}
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Market Cap</span>
                </div>
                <div className="font-semibold text-foreground">
                  {formatNumber(coin.market_cap)}
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Volume 24h</span>
                </div>
                <div className="font-semibold text-foreground">
                  {formatNumber(coin.total_volume)}
                </div>
              </div>
            </div>

            {/* 7d Change */}
            {coin.price_change_percentage_7d_in_currency !== undefined && (
              <div className="glass-card p-4 text-center">
                <span className="text-muted-foreground text-sm">7 Day Change</span>
                <div className={cn(
                  "text-lg font-semibold",
                  coin.price_change_percentage_7d_in_currency >= 0 ? "text-success" : "text-destructive"
                )}>
                  {formatPercent(coin.price_change_percentage_7d_in_currency)}
                </div>
              </div>
            )}
          </div>
        )}

        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
