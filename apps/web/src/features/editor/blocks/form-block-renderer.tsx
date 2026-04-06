'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
  GripVertical, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import { useEditorSelection } from '../editor-selection-context';
import type { FieldType } from '@/modules/form/types';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Type, AlignLeft, Mail, Hash, Phone, Link, Calendar,
  ChevronDown, ListChecks, CheckSquare, Circle,
  Upload, Star, SlidersHorizontal, MessageSquare, Minus,
};

function FieldPreview({ fieldType, label, placeholder, required }: {
  fieldType: FieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
}) {
  const displayLabel = label || FIELD_TYPE_CONFIG[fieldType]?.label || 'Untitled field';

  switch (fieldType) {
    case 'SHORT_TEXT':
    case 'EMAIL':
    case 'NUMBER':
    case 'PHONE':
    case 'URL':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center">
            <span className="text-sm text-muted-foreground">{placeholder || `Enter ${displayLabel.toLowerCase()}...`}</span>
          </div>
        </div>
      );
    case 'LONG_TEXT':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-24 rounded-md border border-input bg-background px-3 py-2">
            <span className="text-sm text-muted-foreground">{placeholder || 'Type your answer...'}</span>
          </div>
        </div>
      );
    case 'DATE':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center">
            <span className="text-sm text-muted-foreground">mm/dd/yyyy</span>
            <Calendar className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      );
    case 'DROPDOWN':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center">
            <span className="text-sm text-muted-foreground">Select an option...</span>
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      );
    case 'CHECKBOX':
    case 'MULTI_SELECT':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="space-y-2">
            {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-input" />
                <span className="text-sm text-muted-foreground">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case 'RADIO':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="space-y-2">
            {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border border-input" />
                <span className="text-sm text-muted-foreground">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case 'FILE_UPLOAD':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-input p-6">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
          </div>
        </div>
      );
    case 'RATING':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className="h-6 w-6 text-muted-foreground/40" />
            ))}
          </div>
        </div>
      );
    case 'SCALE':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="h-9 w-9 rounded-md border border-input flex items-center justify-center text-sm text-muted-foreground">
                {n}
              </div>
            ))}
          </div>
        </div>
      );
    case 'STATEMENT':
      return (
        <div className="py-2">
          <p className="text-base text-foreground">{displayLabel}</p>
        </div>
      );
    case 'PAGE_BREAK':
      return (
        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Page break</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{displayLabel}</p>
          <div className="h-10 rounded-md border border-input bg-background" />
        </div>
      );
  }
}

export function FormBlockRenderer({ node, deleteNode }: NodeViewProps) {
  const { selectedFieldId, onSelectField, validationErrorIds } = useEditorSelection();
  const attrs = node.attrs;
  const fieldId = attrs.fieldId as string;
  const fieldType = attrs.fieldType as FieldType;
  const config = FIELD_TYPE_CONFIG[fieldType];
  const Icon = ICON_MAP[config?.icon] ?? Type;

  const isSelected = selectedFieldId === fieldId;
  const hasError = validationErrorIds.has(fieldId);

  return (
    <NodeViewWrapper className="my-2">
      <div
        onClick={() => onSelectField(fieldId)}
        className={cn(
          'group relative rounded-lg border bg-card p-4 transition-all cursor-pointer',
          isSelected
            ? 'ring-2 ring-primary border-primary shadow-sm'
            : hasError
              ? 'ring-2 ring-destructive border-destructive'
              : 'border-transparent hover:border-border',
        )}
      >
        {/* Drag handle (visible on hover) */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted"
            data-drag-handle
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Delete button (visible on hover) */}
        <div className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); deleteNode(); }}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Field type badge */}
        <div className="flex items-center gap-1.5 mb-3">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{config?.label}</span>
          {hasError && (
            <span className="text-xs text-destructive font-medium ml-auto">Needs attention</span>
          )}
        </div>

        {/* Field preview */}
        <FieldPreview
          fieldType={fieldType}
          label={attrs.label as string}
          placeholder={attrs.placeholder as string | null}
          required={attrs.required as boolean}
        />
      </div>
    </NodeViewWrapper>
  );
}
