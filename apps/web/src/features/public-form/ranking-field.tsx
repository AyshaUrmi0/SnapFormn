'use client';

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface RankingFieldProps {
  options: Option[];
  value: string[];
  error?: string;
  allowDrag?: boolean;
  onChange: (next: string[]) => void;
}

function SortableRankedItem({
  value,
  label,
  index,
  allowDrag,
  onUnrank,
}: {
  value: string;
  label: string;
  index: number;
  allowDrag: boolean;
  onUnrank: () => void;
}) {
  const sortable = useSortable({ id: value, disabled: !allowDrag });
  const style = allowDrag
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }
    : undefined;

  return (
    <div
      ref={allowDrag ? sortable.setNodeRef : undefined}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-background px-3 py-2',
        sortable.isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
        {index + 1}
      </span>
      {allowDrag && (
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <span className="flex-1 text-sm">{label}</span>
      <button
        type="button"
        onClick={onUnrank}
        aria-label={`Unrank ${label}`}
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RankingField({
  options,
  value,
  error,
  allowDrag = true,
  onChange,
}: RankingFieldProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const rankedValues = value.filter((v) => options.some((o) => o.value === v));
  const unrankedOptions = options.filter((o) => !rankedValues.includes(o.value));

  function rank(val: string) {
    onChange([...rankedValues, val]);
  }

  function unrank(val: string) {
    onChange(rankedValues.filter((v) => v !== val));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rankedValues.indexOf(active.id as string);
    const newIndex = rankedValues.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(rankedValues, oldIndex, newIndex));
  }

  const rankedContent = (
    <div className="space-y-1.5">
      {rankedValues.map((val, i) => {
        const opt = options.find((o) => o.value === val);
        if (!opt) return null;
        return (
          <SortableRankedItem
            key={val}
            value={val}
            label={opt.label}
            index={i}
            allowDrag={allowDrag}
            onUnrank={() => unrank(val)}
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'rounded-md',
          error ? 'ring-1 ring-destructive p-2' : undefined,
        )}
      >
        {rankedValues.length > 0 && (
          allowDrag ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rankedValues}
                strategy={verticalListSortingStrategy}
              >
                {rankedContent}
              </SortableContext>
            </DndContext>
          ) : (
            rankedContent
          )
        )}

        {unrankedOptions.length > 0 && (
          <div className={cn('space-y-1.5', rankedValues.length > 0 && 'mt-3')}>
            {rankedValues.length > 0 && (
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Tap to rank
              </p>
            )}
            {unrankedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => rank(opt.value)}
                className="flex w-full items-center gap-2 rounded-md border border-dashed bg-background px-3 py-2 text-left text-sm text-muted-foreground hover:border-input hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-semibold text-muted-foreground">
                  +
                </span>
                <span className="flex-1">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function InteractiveRankingPreview({ options }: { options: Option[] }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <RankingField
      options={options}
      value={value}
      allowDrag={false}
      onChange={setValue}
    />
  );
}
