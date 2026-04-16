'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldOption } from './types';

interface MatrixAxisEditorProps {
  label: string;
  items: FieldOption[];
  /** Human name for a single item — used for placeholder text and the add button. */
  singular: string;
  /** Prefix for auto-generated `value` slugs, e.g. "row" or "col". */
  valuePrefix: string;
  onChange: (items: FieldOption[]) => void;
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export function MatrixAxisEditor({
  label,
  items,
  singular,
  valuePrefix,
  onChange,
}: MatrixAxisEditorProps) {
  function makeItem(index: number): FieldOption {
    const n = index + 1;
    return { label: `${singular} ${n}`, value: `${valuePrefix}_${n}` };
  }

  function addAt(afterIndex: number) {
    const next = [...items];
    next.splice(afterIndex + 1, 0, makeItem(items.length));
    onChange(next);
  }

  function append() {
    onChange([...items, makeItem(items.length)]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateLabel(index: number, nextLabel: string) {
    onChange(
      items.map((item, i) =>
        i === index ? { label: nextLabel, value: slugify(nextLabel) || item.value } : item,
      ),
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input
            placeholder={`${singular} ${i + 1}`}
            value={item.label}
            onChange={(e) => updateLabel(i, (e.target as HTMLInputElement).value)}
            className="h-8 flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() => addAt(i)}
            aria-label={`Add ${singular.toLowerCase()} below`}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove ${singular.toLowerCase()}`}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={append}
        className="h-8 w-full text-xs"
      >
        <Plus className="mr-1 h-3 w-3" />
        Add {singular.toLowerCase()}
      </Button>
    </div>
  );
}
