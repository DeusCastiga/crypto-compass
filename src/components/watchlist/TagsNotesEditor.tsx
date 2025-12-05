import { useState } from 'react';
import { Edit2, Save, X, Tag } from 'lucide-react';
import { WatchlistItem, useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TagsNotesEditorProps {
  item: WatchlistItem;
}

export function TagsNotesEditor({ item }: TagsNotesEditorProps) {
  const { updateWatchlistItem } = useWatchlist();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState(item.tags.join(', '));
  const [note, setNote] = useState(item.note);

  const handleSave = () => {
    const newTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    updateWatchlistItem(item.coinId, { tags: newTags, note });
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 px-3 glass rounded-xl">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img src={item.image} alt={item.name} className="w-6 h-6 rounded-full" />
          <span className="font-medium text-foreground text-sm">{item.symbol.toUpperCase()}</span>
          <div className="flex-1 flex items-center gap-1 overflow-hidden">
            {item.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs shrink-0">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
            )}
          </div>
          {item.note && (
            <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={item.note}>
              {item.note}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit2 className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
              Edit Tags & Notes for {item.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags (comma separated)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="hodl, long-term, defi"
                className="glass border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Note</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your notes about this coin..."
                className="glass border-0 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button className="flex-1 gradient-watchlist border-0" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
