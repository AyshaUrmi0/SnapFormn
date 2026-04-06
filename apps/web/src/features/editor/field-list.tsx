'use client';

import { FieldItem } from './field-item';
import { AddFieldMenu } from './add-field-menu';
import type { EditorField } from './types';
import type { FieldType } from '@/modules/form/types';

interface FieldListProps {
  fields: EditorField[];
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (type: FieldType) => void;
}

export function FieldList({
  fields,
  selectedFieldId,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAdd,
}: FieldListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Fields</h3>
        <span className="text-xs text-muted-foreground">{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">Add your first field</p>
          <AddFieldMenu onAdd={onAdd} />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <FieldItem
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                isFirst={i === 0}
                isLast={i === fields.length - 1}
                onClick={() => onSelect(field.id)}
                onMoveUp={() => onMoveUp(field.id)}
                onMoveDown={() => onMoveDown(field.id)}
                onDelete={() => onDelete(field.id)}
              />
            ))}
          </div>
          <AddFieldMenu onAdd={onAdd} />
        </>
      )}
    </div>
  );
}
