import { cn } from '@/lib/utils';

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <div className={cn("glass-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={cn(
            "text-2xl font-bold",
            trend === 'up' && "text-success",
            trend === 'down' && "text-destructive",
            trend === 'neutral' && "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          trend === 'up' && "bg-success/20",
          trend === 'down' && "bg-destructive/20",
          (!trend || trend === 'neutral') && "bg-primary/20"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            trend === 'up' && "text-success",
            trend === 'down' && "text-destructive",
            (!trend || trend === 'neutral') && "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
}
