import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, TrendingUp, Bookmark, LayoutDashboard } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Mercado', icon: TrendingUp },
  { path: '/watchlist', label: 'Watchlist & Alertas', icon: Bookmark },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Navbar() {
  const { currency, setCurrency, theme, toggleTheme } = useApp();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-market flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">CW</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-foreground">CryptoWatch</h1>
              <p className="text-xs text-muted-foreground">Track. Alert. Profit.</p>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "glass gradient-text-market" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Select value={currency} onValueChange={(v) => setCurrency(v as 'usd' | 'eur' | 'brl')}>
              <SelectTrigger className="w-20 glass border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
                <SelectItem value="brl">BRL</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl hover:bg-muted/50"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-center gap-1 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                  isActive 
                    ? "glass gradient-text-market" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
