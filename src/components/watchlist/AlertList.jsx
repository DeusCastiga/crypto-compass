import { Trash2, Bell, BellOff } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AlertList({ alerts }) {
  const { deleteAlert } = useWatchlist();
  const { formatPrice } = useApp();

  if (alerts.length === 0) {
    return (
      <div className="glass-card text-center py-8">
        <BellOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No alerts created yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={cn(
            "glass-card p-4 flex items-center justify-between gap-4",
            alert.triggered && "ring-2 ring-success/50"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              alert.triggered ? "bg-success/20" : "bg-primary/20"
            )}>
              <Bell className={cn(
                "w-5 h-5",
                alert.triggered ? "text-success" : "text-primary"
              )} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{alert.coinName}</span>
                <span className="text-sm text-muted-foreground uppercase">{alert.coinSymbol}</span>
                {alert.triggered && (
                  <Badge className="bg-success/20 text-success">Triggered</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {alert.direction === 'above' ? '↑' : '↓'} {' '}
                {alert.type === 'price' 
                  ? formatPrice(alert.targetValue)
                  : `${alert.targetValue}%`
                } ({alert.window})
              </p>
              {alert.note && (
                <p className="text-xs text-muted-foreground truncate mt-1">{alert.note}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alert.triggered && alert.triggeredPrice && (
              <div className="text-right mr-4">
                <div className="text-sm text-muted-foreground">Triggered at</div>
                <div className="font-medium text-success">{formatPrice(alert.triggeredPrice)}</div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteAlert(alert.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
