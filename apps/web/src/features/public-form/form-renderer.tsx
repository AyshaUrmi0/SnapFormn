'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Star, Upload, ChevronDown, Clock, Loader2, X, CheckCircle2,
  Image as ImageIcon, Video, Music, Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { slugify } from '@snapform/shared';
import { cn } from '@/lib/utils';
import { uploadToCloudinary, type UploadResult } from '@/lib/cloudinary-upload';
import { runLogic } from '@/features/editor/logic-engine';
import { getScaleOptions } from '@/features/editor/types';
import { expandMentions } from '@/lib/answer-piping';
import { SignaturePad } from './signature-pad';
import { RecaptchaWidget } from './recaptcha-widget';
import type { FormField, FieldType } from '@/modules/form/types';

function getPrefillKey(field: FormField): string {
  const v = field.validations as { prefillKey?: string } | null | undefined;
  if (v?.prefillKey && v.prefillKey.trim()) return v.prefillKey.trim();
  return slugify(field.label || '');
}

/**
 * Context passed to upload components so they call the right signing endpoint.
 *  - respondent: public form, uses slug + PUBLISHED check
 *  - owner: authenticated preview, uses formId + workspace check
 */
export type UploadContext =
  | { mode: 'respondent'; slug: string }
  | { mode: 'owner'; formId: string };

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
  uploadContext: UploadContext;
  field: FormField;
  value: UploadResult | null;
  onChange: (value: UploadResult | null) => void;
}

function FileUploadField({ uploadContext, field, value, onChange }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(
        file,
        uploadContext.mode === 'owner'
          ? {
              mode: 'owner',
              formId: uploadContext.formId,
              fieldId: field.id,
              resourceType: 'auto',
              onProgress: setProgress,
            }
          : {
              mode: 'respondent',
              slug: uploadContext.slug,
              fieldId: field.id,
              resourceType: 'auto',
              onProgress: setProgress,
            },
      );
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
  uploadContext: UploadContext;
  /** All form fields — needed to resolve @mention tokens in text blocks. */
  allFields: FormField[];
  /** Current values including logic-derived CALCULATED fields. */
  derivedValues: Record<string, unknown>;
}

function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
  uploadContext,
  allFields,
  derivedValues,
}: FormFieldRendererProps) {
  const options = parseOptions(field.options);
  const rawLabel = field.label || 'Untitled';
  // Text-only block types (statements, headings, titles, labels) expand
  // @mentions in their label so creators can write "Your total is $@price".
  const TEXT_BLOCKS: FieldType[] = [
    'STATEMENT', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'TITLE', 'LABEL',
  ];
  const displayLabel = TEXT_BLOCKS.includes(field.type)
    ? expandMentions(rawLabel, allFields, derivedValues)
    : rawLabel;

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
          <FileUploadField uploadContext={uploadContext} field={field} value={value as UploadResult | null} onChange={onChange} />
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
      const scaleVal = typeof value === 'number' ? value : null;
      const scale = getScaleOptions(field);
      const steps: number[] = [];
      for (let n = scale.min; n <= scale.max; n++) steps.push(n);
      return (
        <div className="space-y-2">
          {labelEl}
          {descEl}
          <div
            role="radiogroup"
            aria-label={displayLabel}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:flex-nowrap"
          >
            {scale.minLabel && (
              <span className="text-xs text-muted-foreground sm:max-w-[25%] sm:shrink-0">
                {scale.minLabel}
              </span>
            )}
            <div className="flex min-w-0 flex-1 items-start justify-around gap-2 overflow-x-auto">
              {steps.map((n) => {
                const selected = n === scaleVal;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(selected ? null : n)}
                    className="flex flex-col items-center gap-1.5 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-xs text-muted-foreground">{n}</span>
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors',
                        selected
                          ? 'border-primary bg-primary'
                          : 'border-input hover:border-primary',
                      )}
                    >
                      {selected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {scale.maxLabel && (
              <span className="text-xs text-muted-foreground sm:max-w-[25%] sm:shrink-0">
                {scale.maxLabel}
              </span>
            )}
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
      // At runtime, PAGE_BREAK is a structural separator — it splits the
      // form into pages. The splitter below removes it before rendering,
      // so this branch should never fire for a respondent.
      return null;

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
          <SignaturePad
            uploadContext={uploadContext}
            fieldId={field.id}
            value={value as UploadResult | null}
            onChange={onChange}
          />
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
    case 'COUNTRY':
      // These blocks are not visible to respondents — they run logic silently
      return null;

    case 'RECAPTCHA':
      // Renders Google's v2 "I'm not a robot" checkbox. The token is tracked
      // in the parent via onChange and sent with the submission payload.
      return (
        <RecaptchaWidget onChange={(token) => onChange(token)} />
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
  uploadContext: UploadContext;
  fields: FormField[];
  isSubmitting: boolean;
  onSubmit: (
    values: Record<string, unknown>,
    extras: { recaptchaToken?: string },
  ) => void;
  /**
   * When true, form submissions render the thank-you page inline without
   * calling `onSubmit`. Used by the editor "Preview" mode.
   */
  previewMode?: boolean;
  /** Custom thank-you message from form settings. Falls back to a default. */
  thankYouMessage?: string;
}

export function FormRenderer({
  title,
  description,
  uploadContext,
  fields,
  isSubmitting,
  onSubmit,
  previewMode = false,
  thankYouMessage,
}: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const NON_INTERACTIVE_TYPES: FieldType[] = [
    'PAGE_BREAK', 'STATEMENT', 'THANK_YOU_PAGE',
    'HEADING_1', 'HEADING_2', 'HEADING_3', 'DIVIDER', 'TITLE', 'LABEL',
    'IMAGE', 'VIDEO', 'AUDIO', 'EMBED',
    'CONDITIONAL_LOGIC', 'CALCULATED', 'HIDDEN', 'RECAPTCHA', 'COUNTRY',
  ];

  const interactiveFields = fields
    .filter((f) => !NON_INTERACTIVE_TYPES.includes(f.type))
    .sort((a, b) => a.order - b.order);

  const hiddenFields = fields.filter((f) => f.type === 'HIDDEN');
  const calculatedFields = fields.filter((f) => f.type === 'CALCULATED');
  const recaptchaFields = fields.filter((f) => f.type === 'RECAPTCHA');
  const allFields = fields.sort((a, b) => a.order - b.order);

  // Re-run all LOGIC blocks on every value change. `values` gets CALCULATED
  // fields resolved; `hiddenFieldIds` is the set of field IDs explicitly
  // hidden by a logic action. Pure and memoized so it's cheap.
  const logicResult = useMemo(() => runLogic(fields, values), [fields, values]);
  const derivedValues = logicResult.values;
  const hiddenByLogic = logicResult.hiddenFieldIds;

  // On mount, seed values from the URL query string:
  //   1. HIDDEN fields match by their configured `paramName`.
  //   2. Visible/interactive fields match by their `prefillKey` (either the
  //      creator's custom key stored in `validations.prefillKey`, or the
  //      slugified field label as a default).
  // Skipped in preview mode so the editor's preview stays deterministic.
  useEffect(() => {
    if (previewMode) return;
    const params = new URLSearchParams(window.location.search);
    if (params.toString() === '' && hiddenFields.length === 0 && calculatedFields.length === 0) return;

    setValues((prev) => {
      const next = { ...prev };

      for (const field of hiddenFields) {
        const opts = (field.options ?? {}) as { paramName?: string; defaultValue?: string };
        if (!opts.paramName) continue;
        const fromUrl = params.get(opts.paramName);
        next[field.id] = fromUrl ?? opts.defaultValue ?? '';
      }

      // Seed CALCULATED fields with their configured initial value. Logic
      // blocks will mutate these on every respondent answer change.
      for (const field of calculatedFields) {
        const opts = (field.options ?? {}) as { valueType?: 'number' | 'text'; initialValue?: number | string };
        if (next[field.id] === undefined) {
          next[field.id] = opts.initialValue ?? (opts.valueType === 'text' ? '' : 0);
        }
      }

      for (const field of interactiveFields) {
        const key = getPrefillKey(field);
        if (!key) continue;
        const fromUrl = params.get(key);
        if (fromUrl != null && next[field.id] === undefined) {
          next[field.id] = fromUrl;
        }
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, previewMode]);

  // COUNTRY fields are resolved server-side at submission time (from the
  // respondent's real request IP). No client-side fetch here — the client
  // can't be trusted for geo data, and Tally uses the same pattern.

  // Split the form into pages using PAGE_BREAK blocks as separators. Runs
  // on the already-visible set so pages where every field is hidden by a
  // logic block collapse away (the respondent never sees a blank page).
  const pages = useMemo(() => {
    const visibleAll = allFields.filter(
      (f) => f.type !== 'THANK_YOU_PAGE' && !hiddenByLogic.has(f.id),
    );
    const result: FormField[][] = [[]];
    for (const f of visibleAll) {
      if (f.type === 'PAGE_BREAK') {
        result.push([]);
      } else {
        result[result.length - 1].push(f);
      }
    }
    const nonEmpty = result.filter((p) => p.length > 0);
    return nonEmpty.length === 0 ? [[]] : nonEmpty;
  }, [allFields, hiddenByLogic]);

  const activePage = Math.min(currentPage, pages.length - 1);
  const isFirstPage = activePage === 0;
  const isLastPage = activePage === pages.length - 1;
  const currentPageFields = pages[activePage] ?? [];

  function validate(scopeFields: FormField[]): boolean {
    const newErrors: Record<string, string> = {};

    for (const field of scopeFields) {
      if (NON_INTERACTIVE_TYPES.includes(field.type)) continue;
      if (!field.required) continue;
      // A field hidden by logic never needs to be filled in.
      if (hiddenByLogic.has(field.id)) continue;

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

  function handleNextPage() {
    if (!validate(currentPageFields)) return;
    setCurrentPage((p) => p + 1);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handlePrevPage() {
    setCurrentPage((p) => Math.max(0, p - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(interactiveFields)) return;

    // If the form has a reCAPTCHA block, require the token before
    // submitting. The backend also verifies it; this is just UX.
    let recaptchaToken: string | undefined;
    if (recaptchaFields.length > 0 && !previewMode) {
      const first = recaptchaFields[0];
      const token = values[first.id];
      if (typeof token !== 'string' || token.length === 0) {
        setErrors((prev) => ({
          ...prev,
          [first.id]: 'Please complete the reCAPTCHA before submitting.',
        }));
        return;
      }
      recaptchaToken = token;
    }

    // Build submission payload — interactive fields with values, plus every
    // hidden and calculated field (always send, including empty / initial
    // values so the creator sees them in analytics). COUNTRY fields are
    // resolved server-side and injected by the API, so we don't send them
    // at all from the client. Fields hidden by a LOGIC block are dropped —
    // an unanswered hidden question shouldn't leak into the submission.
    const submissionValues: Record<string, unknown> = {};
    for (const field of interactiveFields) {
      if (hiddenByLogic.has(field.id)) continue;
      if (values[field.id] !== undefined && values[field.id] !== '' && values[field.id] !== null) {
        submissionValues[field.id] = values[field.id];
      }
    }
    for (const field of hiddenFields) {
      submissionValues[field.id] = values[field.id] ?? '';
    }
    for (const field of calculatedFields) {
      const opts = (field.options ?? {}) as { valueType?: 'number' | 'text'; initialValue?: number | string };
      const fallback = opts.initialValue ?? (opts.valueType === 'text' ? '' : 0);
      // Prefer the logic-engine-derived value; fall back to the initial if
      // no logic blocks touched it.
      submissionValues[field.id] = derivedValues[field.id] ?? fallback;
    }

    // In preview mode, show the thank-you page locally without calling the API
    if (previewMode) {
      setSubmitted(true);
      return;
    }

    onSubmit(submissionValues, { recaptchaToken });
  }

  // Resolve the thank-you content. Priority:
  //   1. A THANK_YOU_PAGE block in the form's fields (use its label)
  //   2. The `thankYouMessage` prop (from form settings)
  //   3. Default message
  const thankYouBlock = fields.find((f) => f.type === 'THANK_YOU_PAGE');
  const successHeading = thankYouBlock?.label || 'Thanks for your submission!';
  const successDescription =
    thankYouBlock?.description ||
    thankYouMessage ||
    'Your response has been recorded.';

  if (submitted && previewMode) {
    return (
      <div className="flex flex-col items-center text-center py-12 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{successHeading}</h2>
          <p className="text-muted-foreground">{successDescription}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setValues({});
            setErrors({});
            setCurrentPage(0);
          }}
        >
          Fill out again
        </Button>
      </div>
    );
  }

  const isMultiPage = pages.length > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form header — title and description only render on the first page
          so respondents focus on the question at hand on later pages. */}
      {isFirstPage && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      {isMultiPage && (
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Page {activePage + 1} of {pages.length}</span>
          <div className="flex-1 ml-3 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((activePage + 1) / pages.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Only fields for the current page are mounted */}
      <div className="space-y-6">
        {currentPageFields.map((field) => (
          <FormFieldRenderer
            key={field.id}
            uploadContext={uploadContext}
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
            allFields={allFields}
            derivedValues={derivedValues}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        {!isFirstPage && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handlePrevPage}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        {!isLastPage ? (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={handleNextPage}
          >
            Next
          </Button>
        ) : (
          <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        )}
      </div>
    </form>
  );
}
