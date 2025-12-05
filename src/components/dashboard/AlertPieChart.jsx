export function AlertPieChart({ alerts }) {
  const triggered = alerts.filter(a => a.triggered).length;
  const pending = alerts.length - triggered;
  const total = alerts.length;

  if (total === 0) {
    return (
      <div className="glass-card">
        <h3 className="font-semibold text-foreground mb-4">Alert Status</h3>
        <p className="text-muted-foreground text-sm text-center py-4">No alerts to display</p>
      </div>
    );
  }

  const triggeredPercent = (triggered / total) * 100;

  const gradient = `conic-gradient(
    hsl(var(--success)) 0deg ${triggeredPercent * 3.6}deg,
    hsl(var(--primary)) ${triggeredPercent * 3.6}deg 360deg
  )`;

  return (
    <div className="glass-card">
      <h3 className="font-semibold text-foreground mb-4">Alert Status</h3>
      
      <div className="flex items-center justify-center mb-4">
        <div 
          className="w-32 h-32 rounded-full relative"
          style={{ background: gradient }}
        >
          <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Triggered ({triggered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Pending ({pending})</span>
        </div>
      </div>
    </div>
  );
}
