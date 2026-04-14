'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Type as TypeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FIELD_TYPE_CONFIG, FIELD_TYPE_CATEGORIES } from '@/constants/field-types';
import { FIELD_ICON_MAP } from '@/constants/icon-map';
import type { FieldType } from '@/modules/form/types';

interface InsertBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen field type when the user selects an item */
  onSelect: (type: FieldType) => void;
}

interface PaletteItem {
  type: FieldType;
  label: string;
  icon: string;
  category: keyof typeof FIELD_TYPE_CATEGORIES;
}

const ALL_ITEMS: PaletteItem[] = (
  Object.entries(FIELD_TYPE_CONFIG) as [FieldType, { label: string; icon: string; category: PaletteItem['category'] }][]
).map(([type, config]) => ({
  type,
  label: config.label,
  icon: config.icon,
  category: config.category,
}));

export function InsertBlockDialog({ open, onOpenChange, onSelect }: InsertBlockDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input and reset state when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Filter by label + category (fuzzy: every word must match somewhere)
  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ITEMS;
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    return ALL_ITEMS.filter((item) => {
      const haystack = `${item.label} ${FIELD_TYPE_CATEGORIES[item.category]}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [query]);

  // Group filtered results by category, preserving category order
  const groups = useMemo(() => {
    const orderedCats = Object.entries(FIELD_TYPE_CATEGORIES) as [
      PaletteItem['category'],
      string,
    ][];
    return orderedCats
      .map(([key, label]) => ({
        key,
        label,
        items: filtered.filter((item) => item.category === key),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const selectItem = useCallback(
    (item: PaletteItem) => {
      onSelect(item.type);
      onOpenChange(false);
    },
    [onSelect, onOpenChange],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[selectedIndex]) selectItem(flatItems[selectedIndex]);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, flatItems, selectItem]);

  // Scroll selected item into view as user navigates with arrows
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  let flatIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden" showCloseButton={false}>
        <DialogTitle className="sr-only">Insert a block</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields, layout blocks, media..."
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatItems.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No blocks match &ldquo;{query}&rdquo;
            </p>
          )}

          {groups.map((group) => (
            <div key={group.key} className="mb-2 last:mb-0">
              <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const itemIndex = flatIndex++;
                const isSelected = itemIndex === selectedIndex;
                const Icon = FIELD_ICON_MAP[item.icon] ?? TypeIcon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    data-selected={isSelected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer keyboard hints */}
        <div className="flex items-center gap-3 border-t px-4 py-2">
          <span className="text-[11px] text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd> navigate
          </span>
          <span className="text-[11px] text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↵</kbd> select
          </span>
          <span className="text-[11px] text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">esc</kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
