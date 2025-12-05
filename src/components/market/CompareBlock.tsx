import { X } from 'lucide-react';
import { CoinMarket } from '@/hooks/useCoinGecko';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompareBlockProps {
  coins: CoinMarket[];
  onRemove: (coinId: string) => void;
  onClear: () => void;
}

export function CompareBlock({ coins, onRemove, onClear }: CompareBlockProps) {
  const { formatPrice, formatNumber, formatPercent } = useApp();

  if (coins.length === 0) return null;

  return (
    <div className="glass-card mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Compare ({coins.length}/3)</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-3">Coin</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">24h</th>
              <th className="pb-3">7d</th>
              <th className="pb-3">Market Cap</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr key={coin.id} className="border-t border-border/50">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-foreground">{coin.symbol.toUpperCase()}</span>
                  </div>
                </td>
                <td className="py-3 font-medium text-foreground">
                  {formatPrice(coin.current_price)}
                </td>
                <td className={cn(
                  "py-3 font-medium",
                  coin.price_change_percentage_24h >= 0 ? "text-success" : "text-destructive"
                )}>
                  {formatPercent(coin.price_change_percentage_24h)}
                </td>
                <td className={cn(
                  "py-3 font-medium",
                  (coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {coin.price_change_percentage_7d_in_currency !== undefined 
                    ? formatPercent(coin.price_change_percentage_7d_in_currency)
                    : '-'
                  }
                </td>
                <td className="py-3 font-medium text-foreground">
                  {formatNumber(coin.market_cap)}
                </td>
                <td className="py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemove(coin.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
