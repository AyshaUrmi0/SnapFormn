'use client';

import { useState } from 'react';
import { Star, Upload, Calendar, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FormField, FieldType } from '@/modules/form/types';

interface FieldOption {
  label: string;
  value: string;
}

function parseOptions(options: unknown): FieldOption[] {
  if (Array.isArray(options)) {
    return options.filter(
      (o): o is FieldOption =>
        typeof o === 'object' && o !== null && typeof o.label === 'string' && typeof o.value === 'string',
    );
  }
  return [];
}

interface FormFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

function FormFieldRenderer({ field, value, onChange, error }: FormFieldRendererProps) {
  const options = parseOptions(field.options);
  const displayLabel = field.label || 'Untitled';

  const labelEl = (
    <Label className="text-sm font-medium">
      {displayLabel}
      {field.required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );

  const descEl = field.description ? (
    <p className="text-sm text-muted-foreground">{field.description}</p>
  ) : null;

  const errorEl = error ? (
    <p className="text-xs text-destructive">{error}</p>
  ) : null;

  switch (field.type) {
    case 'SHORT_TEXT':
    case 'EMAIL':
    case 'NUMBER':
    case 'PHONE':
    case 'URL':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <Input
            type={inputType(field.type)}
            placeholder={field.placeholder || undefined}
            value={(value as string) ?? ''}
            onChange={(e) => onChange((e.target as HTMLInputElement).value)}
            className={error ? 'border-destructive' : ''}
          />
          {errorEl}
        </div>
      );

    case 'LONG_TEXT':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <textarea
            placeholder={field.placeholder || undefined}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              error && 'border-destructive',
            )}
          />
          {errorEl}
        </div>
      );

    case 'DATE':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="relative">
            <Input
              type="date"
              value={(value as string) ?? ''}
              onChange={(e) => onChange((e.target as HTMLInputElement).value)}
              className={error ? 'border-destructive' : ''}
            />
          </div>
          {errorEl}
        </div>
      );

    case 'DROPDOWN':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="relative">
            <select
              value={(value as string) ?? ''}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                error && 'border-destructive',
                !(value as string) && 'text-muted-foreground',
              )}
            >
              <option value="">Select an option...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errorEl}
        </div>
      );

    case 'CHECKBOX':
    case 'MULTI_SELECT': {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="space-y-2">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, opt.value]);
                    } else {
                      onChange(selected.filter((v) => v !== opt.value));
                    }
                  }}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          {errorEl}
        </div>
      );
    }

    case 'RADIO':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="space-y-2">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  checked={(value as string) === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="h-4 w-4 border-input"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          {errorEl}
        </div>
      );

    case 'FILE_UPLOAD':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-input p-8 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground/70">PNG, JPG, PDF up to 10MB</p>
          </div>
          {errorEl}
        </div>
      );

    case 'RATING': {
      const rating = (value as number) ?? 0;
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n === rating ? 0 : n)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400',
                  )}
                />
              </button>
            ))}
          </div>
          {errorEl}
        </div>
      );
    }

    case 'SCALE': {
      const scaleVal = (value as number) ?? 0;
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n === scaleVal ? 0 : n)}
                className={cn(
                  'h-10 w-10 rounded-lg border flex items-center justify-center text-sm transition-colors',
                  n === scaleVal
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-primary/10',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {errorEl}
        </div>
      );
    }

    case 'STATEMENT':
      return (
        <div className="py-2">
          <p className="text-lg text-foreground">{displayLabel}</p>
          {descEl}
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
          {labelEl}
          <Input
            value={(value as string) ?? ''}
            onChange={(e) => onChange((e.target as HTMLInputElement).value)}
          />
          {errorEl}
        </div>
      );
  }
}

function inputType(fieldType: FieldType): string {
  switch (fieldType) {
    case 'EMAIL': return 'email';
    case 'NUMBER': return 'number';
    case 'PHONE': return 'tel';
    case 'URL': return 'url';
    default: return 'text';
  }
}

// --- Main Form Renderer ---

interface FormRendererProps {
  title: string;
  description: string | null;
  fields: FormField[];
  isSubmitting: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
}

export function FormRenderer({ title, description, fields, isSubmitting, onSubmit }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const interactiveFields = fields
    .filter((f) => f.type !== 'PAGE_BREAK' && f.type !== 'STATEMENT')
    .sort((a, b) => a.order - b.order);

  const allFields = fields.sort((a, b) => a.order - b.order);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    for (const field of interactiveFields) {
      if (!field.required) continue;

      const val = values[field.id];

      if (val === undefined || val === null || val === '') {
        newErrors[field.id] = 'This field is required';
        continue;
      }

      if (Array.isArray(val) && val.length === 0) {
        newErrors[field.id] = 'Please select at least one option';
        continue;
      }

      if (field.type === 'EMAIL' && typeof val === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newErrors[field.id] = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Build submission payload — only interactive fields with values
    const submissionValues: Record<string, unknown> = {};
    for (const field of interactiveFields) {
      if (values[field.id] !== undefined && values[field.id] !== '' && values[field.id] !== null) {
        submissionValues[field.id] = values[field.id];
      }
    }

    onSubmit(submissionValues);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {allFields.map((field) => (
          <FormFieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(val) => {
              setValues((prev) => ({ ...prev, [field.id]: val }));
              if (errors[field.id]) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next[field.id];
                  return next;
                });
              }
            }}
            error={errors[field.id]}
          />
        ))}
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
