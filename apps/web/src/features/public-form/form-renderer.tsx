'use client';

import { useState, useRef } from 'react';
import {
  Star, Upload, ChevronDown, Clock, PenLine, Loader2, X,
  Image as ImageIcon, Video, Music, Code, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadToCloudinary, type UploadResult } from '@/lib/cloudinary-upload';
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

interface FileUploadFieldProps {
  slug: string;
  field: FormField;
  value: UploadResult | null;
  onChange: (value: UploadResult | null) => void;
}

function FileUploadField({ slug, field, value, onChange }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, {
        mode: 'respondent',
        slug,
        fieldId: field.id,
        resourceType: 'auto',
        onProgress: setProgress,
      });
      onChange(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.filename}</p>
          <p className="text-xs text-muted-foreground">
            {(value.bytes / 1024).toFixed(1)} KB · uploaded
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-input p-8 cursor-pointer hover:border-primary/50 transition-colors disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload</p>
            <p className="text-xs text-muted-foreground/70">PNG, JPG, PDF, MP4 up to 100MB</p>
          </>
        )}
      </button>
    </>
  );
}

interface FormFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  slug: string;
}

function FormFieldRenderer({ field, value, onChange, error, slug }: FormFieldRendererProps) {
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
    <p className="text-sm text-destructive">{error}</p>
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
          <FileUploadField slug={slug} field={field} value={value as UploadResult | null} onChange={onChange} />
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

    case 'TIME':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="relative">
            <Input
              type="time"
              value={(value as string) ?? ''}
              onChange={(e) => onChange((e.target as HTMLInputElement).value)}
              className={error ? 'border-destructive' : ''}
            />
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errorEl}
        </div>
      );

    case 'MATRIX': {
      const matrix = field.options as { rows?: { label: string; value: string }[]; columns?: { label: string; value: string }[] } | null;
      const rows = matrix?.rows ?? [];
      const cols = matrix?.columns ?? [];
      const selected = (value as Record<string, string>) ?? {};
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th />
                  {cols.map((c) => <th key={c.value} className="p-2 font-medium text-xs">{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.value} className="border-b last:border-0">
                    <td className="p-2 text-xs text-muted-foreground">{r.label}</td>
                    {cols.map((c) => (
                      <td key={c.value} className="p-2 text-center">
                        <input
                          type="radio"
                          name={`${field.id}-${r.value}`}
                          checked={selected[r.value] === c.value}
                          onChange={() => onChange({ ...selected, [r.value]: c.value })}
                          className="h-4 w-4"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errorEl}
        </div>
      );
    }

    case 'RANKING': {
      const ordered = (value as string[]) ?? options.map((o) => o.value);
      function move(index: number, dir: -1 | 1) {
        const next = [...ordered];
        const ni = index + dir;
        if (ni < 0 || ni >= next.length) return;
        [next[index], next[ni]] = [next[ni], next[index]];
        onChange(next);
      }
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="space-y-1.5">
            {ordered.map((val, i) => {
              const opt = options.find((o) => o.value === val);
              if (!opt) return null;
              return (
                <div key={val} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <span className="flex-1 text-sm">{opt.label}</span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-xs disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === ordered.length - 1} className="px-1.5 text-xs disabled:opacity-30">↓</button>
                </div>
              );
            })}
          </div>
          {errorEl}
        </div>
      );
    }

    case 'SIGNATURE':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="h-32 rounded-md border-2 border-dashed border-input bg-background flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PenLine className="h-4 w-4" />
              <span className="text-sm">Signature capture coming soon</span>
            </div>
          </div>
          {errorEl}
        </div>
      );

    case 'THANK_YOU_PAGE':
      return null;

    case 'HEADING_1':
      return <h1 className="text-3xl font-bold">{displayLabel}</h1>;
    case 'HEADING_2':
      return <h2 className="text-2xl font-semibold">{displayLabel}</h2>;
    case 'HEADING_3':
      return <h3 className="text-xl font-semibold">{displayLabel}</h3>;
    case 'DIVIDER':
      return <div className="h-px w-full bg-border my-4" />;
    case 'TITLE':
      return <h1 className="text-4xl font-bold tracking-tight">{displayLabel}</h1>;
    case 'LABEL':
      return (
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {displayLabel}
        </p>
      );

    case 'IMAGE': {
      const media = field.options as { src?: string } | null;
      if (!media?.src) {
        return (
          <div className="h-32 rounded-md border-2 border-dashed border-input bg-muted/20 flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        );
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={media.src} alt={displayLabel} className="rounded-md max-w-full" />;
    }

    case 'VIDEO': {
      const media = field.options as { src?: string } | null;
      if (!media?.src) {
        return (
          <div className="aspect-video rounded-md border-2 border-dashed border-input bg-muted/20 flex items-center justify-center">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
        );
      }
      const isYouTube = /youtube\.com|youtu\.be/.test(media.src);
      const isVimeo = /vimeo\.com/.test(media.src);
      if (isYouTube || isVimeo) {
        return (
          <iframe
            src={media.src}
            className="w-full aspect-video rounded-md"
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
            allowFullScreen
            title={displayLabel}
          />
        );
      }
      return <video src={media.src} controls className="w-full rounded-md" />;
    }

    case 'AUDIO': {
      const media = field.options as { src?: string } | null;
      if (!media?.src) {
        return (
          <div className="flex items-center gap-2 rounded-md border border-input bg-muted/20 px-3 py-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">No audio source</span>
          </div>
        );
      }
      return <audio src={media.src} controls className="w-full" />;
    }

    case 'EMBED': {
      const media = field.options as { src?: string } | null;
      if (!media?.src) {
        return (
          <div className="rounded-md border border-input bg-muted/20 p-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Embed URL not set</span>
          </div>
        );
      }
      return (
        <iframe
          src={media.src}
          className="w-full h-64 rounded-md border"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title={displayLabel}
        />
      );
    }

    case 'CONDITIONAL_LOGIC':
    case 'CALCULATED':
    case 'HIDDEN':
    case 'RECAPTCHA':
      // These blocks are not visible to respondents — they run logic silently
      return null;

    case 'COUNTRY':
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div className="h-10 rounded-md border border-input bg-muted/20 px-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {(value as string) || 'Auto-detected from IP'}
            </span>
          </div>
          {errorEl}
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
  slug: string;
  fields: FormField[];
  isSubmitting: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
}

export function FormRenderer({ title, description, slug, fields, isSubmitting, onSubmit }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const NON_INTERACTIVE_TYPES: FieldType[] = [
    'PAGE_BREAK', 'STATEMENT', 'THANK_YOU_PAGE',
    'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
    'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
    'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA',
  ];

  const interactiveFields = fields
    .filter((f) => !NON_INTERACTIVE_TYPES.includes(f.type))
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
            slug={slug}
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
