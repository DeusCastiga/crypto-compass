import { Pin, PinOff, Plus, Eye, Check, GitCompare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkline } from '@/components/ui/Sparkline';
import { cn } from '@/lib/utils';

export function CoinCard({ 
  coin, 
  onViewDetails, 
  onCompare, 
  isComparing = false,
  tags,
  note,
  showActions = true 
}) {
  const { formatPrice, formatNumber, formatPercent } = useApp();
  const { addToWatchlist, isInWatchlist, isPinned, togglePin } = useWatchlist();

  const inWatchlist = isInWatchlist(coin.id);
  const pinned = isPinned(coin.id);
  const priceUp = coin.price_change_percentage_24h >= 0;

  return (
    <div className={cn(
      "glass-card group relative overflow-hidden",
      pinned && "ring-2 ring-primary/50"
    )}>
      {/* Rank Badge */}
      <div className="absolute top-3 right-3">
        <span className="text-xs text-muted-foreground font-medium">#{coin.market_cap_rank}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={coin.image} 
          alt={coin.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{coin.name}</h3>
          <span className="text-sm text-muted-foreground uppercase">{coin.symbol}</span>
        </div>
      </div>

      {/* Price & Change */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatPrice(coin.current_price)}
        </div>
        <Badge 
          variant={priceUp ? "default" : "destructive"}
          className={cn(
            "font-medium",
            priceUp ? "bg-success/20 text-success hover:bg-success/30" : "bg-destructive/20 text-destructive hover:bg-destructive/30"
          )}
        >
          {formatPercent(coin.price_change_percentage_24h)}
        </Badge>
      </div>

      {/* Sparkline */}
      {coin.sparkline_in_7d?.price && (
        <div className="mb-4">
          <Sparkline 
            data={coin.sparkline_in_7d.price} 
            width={200}
            height={40}
            className="w-full"
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <span className="text-muted-foreground">Market Cap</span>
          <div className="font-medium text-foreground">{formatNumber(coin.market_cap)}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Volume 24h</span>
          <div className="font-medium text-foreground">{formatNumber(coin.total_volume)}</div>
        </div>
      </div>

      {/* Tags & Notes */}
      {(tags?.length || note) && (
        <div className="mb-4 space-y-2">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {note && (
            <p className="text-xs text-muted-foreground line-clamp-2">{note}</p>
          )}
        </div>
      )}

      {/* In Watchlist Badge */}
      {inWatchlist && (
        <Badge variant="secondary" className="mb-4 bg-secondary/20 text-secondary">
          <Check className="w-3 h-3 mr-1" />
          In Watchlist
        </Badge>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(coin)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          
          {!inWatchlist && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addToWatchlist({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                image: coin.image,
              })}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              Watchlist
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => togglePin(coin.id)}
            className={cn(pinned && "text-warning")}
          >
            {pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </Button>

          {onCompare && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCompare(coin)}
              className={cn(isComparing && "text-primary")}
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
