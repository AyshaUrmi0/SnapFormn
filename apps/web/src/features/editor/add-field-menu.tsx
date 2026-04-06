'use client';

import {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FIELD_TYPE_CONFIG, FIELD_TYPE_CATEGORIES } from '@/constants/field-types';
import type { FieldType } from '@/modules/form/types';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
};

interface AddFieldMenuProps {
  onAdd: (type: FieldType) => void;
}

export function AddFieldMenu({ onAdd }: AddFieldMenuProps) {
  const categories = Object.entries(FIELD_TYPE_CATEGORIES) as [keyof typeof FIELD_TYPE_CATEGORIES, string][];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full">
        <Plus className="h-4 w-4" />
        Add field
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {categories.map(([key, label], i) => {
          const fields = Object.entries(FIELD_TYPE_CONFIG).filter(
            ([, config]) => config.category === key,
          );
          if (fields.length === 0) return null;
          return (
            <div key={key}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                {fields.map(([type, config]) => {
                  const Icon = ICON_MAP[config.icon] ?? Type;
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => onAdd(type as FieldType)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {config.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
