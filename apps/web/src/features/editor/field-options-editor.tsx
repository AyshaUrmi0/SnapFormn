'use client';

import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldOption } from './types';

interface FieldOptionsEditorProps {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}

export function FieldOptionsEditor({ options, onChange }: FieldOptionsEditorProps) {
  function addOption() {
    const index = options.length + 1;
    onChange([...options, { label: `Option ${index}`, value: `option_${index}` }]);
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function updateOptionLabel(index: number, label: string) {
    const updated = options.map((opt, i) => {
      if (i !== index) return opt;
      // Auto-generate value from label
      const value = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      return { label, value };
    });
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      <Label>Options</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5 group">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <Input
            placeholder={`Option ${i + 1}`}
            value={opt.label}
            onChange={(e) => updateOptionLabel(i, (e.target as HTMLInputElement).value)}
            className="flex-1 h-8 text-sm"
          />
          <button
            type="button"
            onClick={() => removeOption(i)}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full h-8 text-xs">
        <Plus className="mr-1 h-3 w-3" />
        Add option
      </Button>
    </div>
  );
}
