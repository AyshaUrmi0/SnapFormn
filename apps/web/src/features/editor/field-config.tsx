'use client';

import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import { FieldOptionsEditor } from './field-options-editor';
import { CHOICE_FIELD_TYPES } from './types';
import type { EditorField, FieldOption } from './types';

interface FieldConfigProps {
  field: EditorField;
  onChange: (updates: Partial<EditorField>) => void;
  onClose: () => void;
  errors?: string[];
}

const NO_PLACEHOLDER_TYPES = [
  'STATEMENT', 'PAGE_BREAK', 'FILE_UPLOAD', 'RATING', 'SCALE', 'CHECKBOX',
  'MATRIX', 'RANKING', 'SIGNATURE', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
];
const NO_REQUIRED_TYPES = [
  'STATEMENT', 'PAGE_BREAK', 'THANK_YOU_PAGE',
  'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
  'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
  'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA',
];

export function FieldConfig({ field, onChange, onClose, errors }: FieldConfigProps) {
  const config = FIELD_TYPE_CONFIG[field.type];
  const showPlaceholder = !NO_PLACEHOLDER_TYPES.includes(field.type);
  const showRequired = !NO_REQUIRED_TYPES.includes(field.type);
  const showOptions = CHOICE_FIELD_TYPES.includes(field.type);

  const hasLabelError = errors?.some((e) => e.toLowerCase().includes('label'));
  const hasOptionsError = errors?.some((e) => e.toLowerCase().includes('option'));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{config.label}</h3>
          <p className="text-xs text-muted-foreground">Configure this field</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onChange({ label: (e.target as HTMLInputElement).value })}
            placeholder="Field label"
            className={hasLabelError ? 'border-destructive' : ''}
          />
          {hasLabelError && (
            <p className="text-sm text-destructive">Label is required</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="field-description">Description</Label>
          <Input
            id="field-description"
            value={field.description ?? ''}
            onChange={(e) => onChange({ description: (e.target as HTMLInputElement).value || null })}
            placeholder="Help text (optional)"
          />
        </div>

        {showPlaceholder && (
          <div className="space-y-1.5">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder ?? ''}
              onChange={(e) => onChange({ placeholder: (e.target as HTMLInputElement).value || null })}
              placeholder="Placeholder text (optional)"
            />
          </div>
        )}

        {showRequired && (
          <div className="flex items-center justify-between">
            <Label htmlFor="field-required">Required</Label>
            <Switch
              id="field-required"
              checked={field.required}
              onCheckedChange={(checked) => onChange({ required: checked })}
            />
          </div>
        )}
      </div>

      {showOptions && (
        <>
          <Separator />
          <div>
            <FieldOptionsEditor
              options={field.options ?? []}
              onChange={(options: FieldOption[]) => onChange({ options })}
            />
            {hasOptionsError && (
              <p className="text-sm text-destructive mt-1">At least one option is required</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
