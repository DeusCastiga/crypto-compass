import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWatchlist, WatchlistItem } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AlertFormProps {
  watchlistItems: WatchlistItem[];
}

export function AlertForm({ watchlistItems }: AlertFormProps) {
  const { createAlert } = useWatchlist();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    coinId: '',
    type: 'price' as 'price' | 'percent',
    direction: 'above' as 'above' | 'below',
    targetValue: '',
    window: '24h' as '24h' | '7d',
    note: '',
  });

  const selectedCoin = watchlistItems.find(item => item.coinId === formData.coinId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin || !formData.targetValue) return;

    createAlert({
      coinId: formData.coinId,
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      type: formData.type,
      direction: formData.direction,
      targetValue: parseFloat(formData.targetValue),
      window: formData.window,
      note: formData.note,
    });

    setOpen(false);
    setFormData({
      coinId: '',
      type: 'price',
      direction: 'above',
      targetValue: '',
      window: '24h',
      note: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-watchlist border-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Coin</Label>
            <Select value={formData.coinId} onValueChange={(v) => setFormData(prev => ({ ...prev, coinId: v }))}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="Choose from watchlist" />
              </SelectTrigger>
              <SelectContent className="glass">
                {watchlistItems.map((item) => (
                  <SelectItem key={item.coinId} value={item.coinId}>
                    <div className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-5 h-5 rounded-full" />
                      {item.name} ({item.symbol.toUpperCase()})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alert Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as 'price' | 'percent' }))}>
                <SelectTrigger className="glass border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="price">Price Target</SelectItem>
                  <SelectItem value="percent">% Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={formData.direction} onValueChange={(v) => setFormData(prev => ({ ...prev, direction: v as 'above' | 'below' }))}>
                <SelectTrigger className="glass border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="above">Goes Above ↑</SelectItem>
                  <SelectItem value="below">Goes Below ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{formData.type === 'price' ? 'Target Price' : 'Target %'}</Label>
              <Input
                type="number"
                step="any"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                placeholder={formData.type === 'price' ? '50000' : '10'}
                className="glass border-0"
              />
            </div>

            <div className="space-y-2">
              <Label>Time Window</Label>
              <Select value={formData.window} onValueChange={(v) => setFormData(prev => ({ ...prev, window: v as '24h' | '7d' }))}>
                <SelectTrigger className="glass border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Add a note for this alert..."
              className="glass border-0 resize-none"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full gradient-watchlist border-0" disabled={!formData.coinId || !formData.targetValue}>
            Create Alert
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
