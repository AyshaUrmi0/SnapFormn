'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RenameFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
  loading?: boolean;
}

export function RenameFormDialog({
  open,
  onOpenChange,
  currentTitle,
  onRename,
  loading = false,
}: RenameFormDialogProps) {
  const [title, setTitle] = useState(currentTitle);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || trimmed === currentTitle) return;
    onRename(trimmed);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTitle(currentTitle);
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename form</DialogTitle>
            <DialogDescription>Enter a new title for this form.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="rename-title">Title</Label>
            <Input
              id="rename-title"
              value={title}
              onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
              placeholder="Form title"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || title.trim() === currentTitle}>
              {loading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
