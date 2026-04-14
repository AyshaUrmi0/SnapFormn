'use client';

import {
  forwardRef, useEffect, useImperativeHandle, useState, useCallback,
} from 'react';
import { Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIELD_TYPE_CONFIG, FIELD_TYPE_CATEGORIES } from '@/constants/field-types';
import { FIELD_ICON_MAP } from '@/constants/icon-map';
import type { FieldType } from '@/modules/form/types';

interface CommandItem {
  type: FieldType;
  label: string;
  icon: string;
  category: string;
  command: (editor: any) => void;
}

function defaultOptionsForType(type: FieldType): string {
  const choiceTypes = ['DROPDOWN', 'MULTI_SELECT', 'CHECKBOX', 'RADIO', 'RANKING'];
  if (choiceTypes.includes(type)) {
    return JSON.stringify([
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
    ]);
  }
  if (type === 'MATRIX') {
    return JSON.stringify({
      rows: [
        { label: 'Row 1', value: 'row_1' },
        { label: 'Row 2', value: 'row_2' },
      ],
      columns: [
        { label: 'Column 1', value: 'col_1' },
        { label: 'Column 2', value: 'col_2' },
      ],
    });
  }
  if (type === 'EMBED' || type === 'IMAGE' || type === 'VIDEO' || type === 'AUDIO') {
    return JSON.stringify({ src: '', width: null, height: null });
  }
  if (type === 'HIDDEN') {
    return JSON.stringify({ paramName: '', defaultValue: '' });
  }
  if (type === 'CALCULATED') {
    return JSON.stringify({ formula: '' });
  }
  if (type === 'RECAPTCHA') {
    return JSON.stringify({ siteKey: '' });
  }
  if (type === 'CONDITIONAL_LOGIC') {
    return JSON.stringify({ rules: [] });
  }
  return '[]';
}

/**
 * Build the insert-content payload for a given field type. Exported so the
 * InsertBlockDialog can reuse the same insert logic without duplicating.
 */
export function buildInsertPayload(type: FieldType, label: string) {
  return [
    {
      type: 'formBlock',
      attrs: {
        fieldId: crypto.randomUUID(),
        fieldType: type,
        label,
        description: null,
        placeholder: null,
        required: false,
        options: defaultOptionsForType(type),
      },
    },
    // Trailing paragraph — gives the user an immediate place to keep typing
    // or trigger the slash command again. Without this, TipTap leaves a gap
    // cursor (visible as an underscore) and Enter has no target.
    { type: 'paragraph' },
  ];
}

function buildCommandItems(): CommandItem[] {
  return (Object.entries(FIELD_TYPE_CONFIG) as [FieldType, { label: string; icon: string; category: string }][]).map(
    ([type, config]) => ({
      type,
      label: config.label,
      icon: config.icon,
      category: config.category,
      command: (editor: any) => {
        editor
          .chain()
          .focus()
          .insertContent(buildInsertPayload(type, config.label))
          .run();
      },
    }),
  );
}

const ALL_COMMANDS = buildCommandItems();

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="z-50 w-64 overflow-hidden rounded-lg border bg-popover p-2 shadow-lg">
          <p className="px-2 py-1.5 text-sm text-muted-foreground">No results</p>
        </div>
      );
    }

    const categories = Object.entries(FIELD_TYPE_CATEGORIES) as [string, string][];
    let flatIndex = 0;

    return (
      <div className="z-50 w-64 max-h-80 overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg">
        {categories.map(([catKey, catLabel]) => {
          const catItems = items.filter((item) => item.category === catKey);
          if (catItems.length === 0) return null;

          return (
            <div key={catKey}>
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {catLabel}
              </p>
              {catItems.map((item) => {
                const itemIndex = flatIndex++;
                const Icon = FIELD_ICON_MAP[item.icon] ?? Type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      itemIndex === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted',
                    )}
                    onClick={() => selectItem(items.indexOf(item))}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  },
);

SlashCommandList.displayName = 'SlashCommandList';

export { ALL_COMMANDS };
export type { CommandItem };
