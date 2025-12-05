import { Alert } from '@/contexts/WatchlistContext';

interface AlertDistributionChartProps {
  alerts: Alert[];
}

export function AlertDistributionChart({ alerts }: AlertDistributionChartProps) {
  // Group alerts by coin
  const distribution = alerts.reduce((acc, alert) => {
    acc[alert.coinSymbol] = (acc[alert.coinSymbol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(distribution), 1);
  const total = alerts.length;

  const colors = [
    'bg-chart-1',
    'bg-chart-2',
    'bg-chart-3',
    'bg-chart-4',
    'bg-chart-5',
  ];

  if (entries.length === 0) {
    return (
      <div className="glass-card">
        <h3 className="font-semibold text-foreground mb-4">Alert Distribution</h3>
        <p className="text-muted-foreground text-sm text-center py-4">No alerts to display</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 className="font-semibold text-foreground mb-4">Alert Distribution by Coin</h3>
      <div className="space-y-3">
        {entries.map(([symbol, count], index) => (
          <div key={symbol}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-foreground uppercase">{symbol}</span>
              <span className="text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
