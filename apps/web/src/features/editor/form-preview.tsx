'use client';

import {
  Calendar, ChevronDown, Upload, Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import type { EditorField, FieldOption } from './types';
import type { FieldType } from '@/modules/form/types';

function PreviewField({ field }: { field: EditorField }) {
  const displayLabel = field.label || FIELD_TYPE_CONFIG[field.type]?.label || 'Untitled';
  const options: FieldOption[] = field.options ?? [];

  switch (field.type) {
    case 'SHORT_TEXT':
    case 'EMAIL':
    case 'NUMBER':
    case 'PHONE':
    case 'URL':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <Input
            type={field.type === 'EMAIL' ? 'email' : field.type === 'NUMBER' ? 'number' : 'text'}
            placeholder={field.placeholder || undefined}
            disabled
          />
        </div>
      );

    case 'LONG_TEXT':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <textarea
            placeholder={field.placeholder || undefined}
            disabled
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      );

    case 'DATE':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="relative">
            <Input type="date" disabled />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      );

    case 'DROPDOWN':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="relative">
            <select
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an option...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      );

    case 'CHECKBOX':
    case 'MULTI_SELECT':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="space-y-2">
            {(options.length > 0 ? options : [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" disabled className="h-4 w-4 rounded border-input" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'RADIO':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="space-y-2">
            {(options.length > 0 ? options : [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name={field.id} disabled className="h-4 w-4 border-input" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'FILE_UPLOAD':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-input p-8">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground/70">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>
      );

    case 'RATING':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" disabled className="p-1">
                <Star className="h-7 w-7 text-muted-foreground/30 hover:text-yellow-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'SCALE':
      return (
        <div className="space-y-2">
          <Label>
            {displayLabel}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                disabled
                className="h-10 w-10 rounded-lg border border-input flex items-center justify-center text-sm hover:bg-primary hover:text-primary-foreground transition-colors disabled:cursor-not-allowed"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );

    case 'STATEMENT':
      return (
        <div className="py-2">
          <p className="text-lg text-foreground">{displayLabel}</p>
          {field.description && <p className="text-sm text-muted-foreground mt-1">{field.description}</p>}
        </div>
      );

    case 'PAGE_BREAK':
      return (
        <div className="flex items-center gap-4 py-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Next page</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label>{displayLabel}</Label>
          <Input disabled />
        </div>
      );
  }
}

interface FormPreviewProps {
  title: string;
  fields: EditorField[];
}

export function FormPreview({ title, fields }: FormPreviewProps) {
  return (
    <div className="py-8 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Form header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{title || 'Untitled form'}</h1>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {fields.map((field) => (
            <PreviewField key={field.id} field={field} />
          ))}
        </div>

        {fields.length > 0 && (
          <div className="pt-4">
            <Button className="w-full" size="lg" disabled>
              Submit
            </Button>
          </div>
        )}

        {fields.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No fields added yet. Go back to the editor to add form blocks.</p>
          </div>
        )}
      </div>
    </div>
  );
}
