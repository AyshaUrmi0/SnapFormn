'use client';

import {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ChevronUp, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import type { EditorField } from './types';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
};

interface FieldItemProps {
  field: EditorField;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function FieldItem({
  field,
  isSelected,
  isFirst,
  isLast,
  onClick,
  onMoveUp,
  onMoveDown,
  onDelete,
}: FieldItemProps) {
  const config = FIELD_TYPE_CONFIG[field.type];
  const Icon = ICON_MAP[config.icon] ?? Type;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50',
        isSelected && 'ring-2 ring-primary border-primary',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', !field.label && 'text-muted-foreground italic')}>
          {field.label || 'Untitled field'}
        </p>
        <p className="text-xs text-muted-foreground">{config.label}</p>
      </div>
      {field.required && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Required</Badge>}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
