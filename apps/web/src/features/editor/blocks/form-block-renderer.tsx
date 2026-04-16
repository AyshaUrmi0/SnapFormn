'use client';

import { useEffect, useMemo, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Type,
  Calendar,
  ChevronDown,
  Upload,
  Star,
  Clock,
  PenLine,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  GitBranch,
  Calculator,
  EyeOff,
  Shield,
  Globe,
  GripVertical,
  Trash2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDetectedCountry } from '@/lib/detect-country';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import { FIELD_ICON_MAP } from '@/constants/icon-map';
import { useEditorSelection } from '../editor-selection-context';
import { InsertBlockDialog } from '../insert-block-dialog';
import { buildInsertPayload } from './slash-command-list';
import type { FieldType } from '@/modules/form/types';

interface KeyValue {
  label: string;
  value: string;
}
interface MatrixShape {
  rows?: KeyValue[];
  columns?: KeyValue[];
}
interface MediaShape {
  src?: string;
}

function parseJson<T>(json: unknown): T | null {
  if (typeof json !== 'string' || !json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function CountryPreview({ displayLabel }: { displayLabel: string }) {
  const country = useDetectedCountry();
  const [showFallback, setShowFallback] = useState(false);
  useEffect(() => {
    if (country) return;
    const t = setTimeout(() => setShowFallback(true), 4000);
    return () => clearTimeout(t);
  }, [country]);

  const displayText = country
    ? country
    : showFallback
      ? 'Country detection will work when respondents submit.'
      : 'Detecting your country…';

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{displayLabel}</p>
      <div className="h-10 rounded-md border border-input bg-muted/20 px-3 flex items-center gap-2 select-none pointer-events-none">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">{displayText}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Auto-detected from respondent&apos;s IP at submission time. Read-only.
      </p>
    </div>
  );
}

function FieldPreview({
  fieldType,
  label,
  placeholder,
  required,
  options,
  pageIndex,
}: {
  fieldType: FieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string | null;
  pageIndex?: number;
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
            <span className="text-sm text-muted-foreground">
              {placeholder || `Enter ${displayLabel.toLowerCase()}...`}
            </span>
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
            <span className="text-sm text-muted-foreground">
              {placeholder || 'Type your answer...'}
            </span>
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
    case 'DROPDOWN': {
      const parsedOpts = parseJson<KeyValue[]>(options) ?? [];
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center">
            <span className="text-sm text-muted-foreground">
              {parsedOpts.length > 0 ? parsedOpts[0].label : 'Select an option...'}
            </span>
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      );
    }
    case 'CHECKBOX':
    case 'MULTI_SELECT': {
      const parsedOpts = parseJson<KeyValue[]>(options) ?? [];
      const items =
        parsedOpts.length > 0
          ? parsedOpts
          : [
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
            ];
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="space-y-2">
            {items.map((opt, i) => (
              <label key={`${opt.value}-${i}`} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-input" />
                <span className="text-sm text-muted-foreground">
                  {opt.label || `Option ${i + 1}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    case 'RADIO': {
      const parsedOpts = parseJson<KeyValue[]>(options) ?? [];
      const items =
        parsedOpts.length > 0
          ? parsedOpts
          : [
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
            ];
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="space-y-2">
            {items.map((opt, i) => (
              <label key={`${opt.value}-${i}`} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border border-input" />
                <span className="text-sm text-muted-foreground">
                  {opt.label || `Option ${i + 1}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    }
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
              <div
                key={n}
                className="h-9 w-9 rounded-md border border-input flex items-center justify-center text-sm text-muted-foreground"
              >
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
    case 'PAGE_BREAK': {
      // pageIndex is 0-based position among PAGE_BREAK blocks.
      // The block marks the end of page (index+1) and start of (index+2).
      const fromPage = (pageIndex ?? 0) + 1;
      const toPage = fromPage + 1;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2 rounded-full border border-dashed border-border bg-muted/40 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Page {fromPage}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Page {toPage}
            </span>
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>
      );
    }

    case 'TIME':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center">
            <span className="text-sm text-muted-foreground">--:--</span>
            <Clock className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      );
    case 'MATRIX': {
      const parsed = parseJson<MatrixShape>(options);
      const rows = parsed?.rows ?? [
        { label: 'Row 1', value: 'r1' },
        { label: 'Row 2', value: 'r2' },
      ];
      const cols = parsed?.columns ?? [
        { label: 'Col 1', value: 'c1' },
        { label: 'Col 2', value: 'c2' },
      ];
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {cols.map((c) => (
                    <th key={c.value} className="p-1.5 font-normal text-muted-foreground">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.value}>
                    <td className="p-1.5 text-muted-foreground">{r.label}</td>
                    {cols.map((c) => (
                      <td key={c.value} className="p-1.5 text-center">
                        <div className="h-3 w-3 mx-auto rounded-full border border-input" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    case 'RANKING': {
      const parsedOpts = parseJson<KeyValue[]>(options) ?? [];
      const items =
        parsedOpts.length > 0
          ? parsedOpts
          : [
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
            ];
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="space-y-1">
            {items.map((opt, i) => (
              <div
                key={`${opt.value}-${i}`}
                className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5"
              >
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {opt.label || `Option ${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'SIGNATURE':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {displayLabel}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          <div className="h-24 rounded-md border-2 border-dashed border-input bg-background flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PenLine className="h-4 w-4" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        </div>
      );

    case 'THANK_YOU_PAGE':
      return (
        <div className="flex items-center gap-3 py-3 rounded-md bg-primary/5 border border-primary/20 px-4">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">{displayLabel}</p>
            <p className="text-xs text-muted-foreground">
              Shown after a respondent submits the form
            </p>
          </div>
        </div>
      );
    case 'HEADING_1':
      return <h1 className="text-3xl font-bold">{displayLabel}</h1>;
    case 'HEADING_2':
      return <h2 className="text-2xl font-semibold">{displayLabel}</h2>;
    case 'HEADING_3':
      return <h3 className="text-xl font-semibold">{displayLabel}</h3>;
    case 'DIVIDER':
      return <div className="h-px w-full bg-border my-2" />;
    case 'TITLE':
      return <h1 className="text-4xl font-bold tracking-tight">{displayLabel}</h1>;
    case 'LABEL':
      return (
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {displayLabel}
        </p>
      );

    case 'IMAGE': {
      const media = parseJson<MediaShape>(options);
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{displayLabel}</p>
          {media?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.src} alt={displayLabel} className="rounded-md max-h-48 border" />
          ) : (
            <div className="h-32 rounded-md border-2 border-dashed border-input bg-muted/20 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      );
    }
    case 'VIDEO': {
      const media = parseJson<MediaShape>(options);
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{displayLabel}</p>
          <div className="aspect-video rounded-md border-2 border-dashed border-input bg-muted/20 flex items-center justify-center">
            {media?.src ? (
              <span className="text-xs text-muted-foreground truncate px-3">{media.src}</span>
            ) : (
              <Video className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        </div>
      );
    }
    case 'AUDIO': {
      const media = parseJson<MediaShape>(options);
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{displayLabel}</p>
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {media?.src || 'No audio source set'}
            </span>
          </div>
        </div>
      );
    }
    case 'EMBED': {
      const media = parseJson<MediaShape>(options);
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{displayLabel}</p>
          <div className="rounded-md border border-input bg-muted/20 p-3 flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {media?.src || 'Embed URL not set'}
            </span>
          </div>
        </div>
      );
    }

    case 'CONDITIONAL_LOGIC': {
      const parsed = parseJson<{
        combinator?: 'and' | 'or';
        conditions?: unknown[];
        actions?: unknown[];
      }>(options);
      const conditionCount = parsed?.conditions?.length ?? 0;
      const actionCount = parsed?.actions?.length ?? 0;
      const combinator = parsed?.combinator === 'or' ? 'ANY' : 'ALL';
      return (
        <div className="rounded-md border border-dashed border-input p-3 bg-muted/10">
          <div className="flex items-center gap-3">
            <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Logic</p>
              {conditionCount === 0 && actionCount === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Configure IF / THEN rules in the sidebar. Invisible to respondents.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  If {combinator} of {conditionCount} condition{conditionCount !== 1 ? 's' : ''}{' '}
                  match → {actionCount} action{actionCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    case 'CALCULATED': {
      const parsed = parseJson<{
        valueType?: 'number' | 'text';
        initialValue?: number | string;
        initialValueFieldId?: string | null;
      }>(options);
      const valueType = parsed?.valueType ?? 'number';
      const initial = parsed?.initialValue ?? (valueType === 'text' ? '' : 0);
      const sourceFieldId = parsed?.initialValueFieldId;
      const initialLabel = sourceFieldId
        ? `from field ↗`
        : valueType === 'text'
          ? `"${initial}"`
          : String(initial);
      return (
        <div className="flex items-center gap-3 rounded-md border border-dashed border-input p-3 bg-muted/10">
          <Calculator className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {displayLabel}
              <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                calculated · {valueType}
              </span>
            </p>
            <p className="text-xs font-mono text-muted-foreground truncate">
              initial = {initialLabel} · invisible to respondents
            </p>
          </div>
        </div>
      );
    }
    case 'HIDDEN': {
      const parsed = parseJson<{ paramName?: string }>(options);
      return (
        <div className="flex items-center gap-3 rounded-md border border-dashed border-input p-3">
          <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{displayLabel}</p>
            <p className="text-xs font-mono text-muted-foreground truncate">
              {parsed?.paramName ? `?${parsed.paramName}=` : 'No query param set'}
            </p>
          </div>
        </div>
      );
    }
    case 'RECAPTCHA':
      return (
        <div className="rounded-md border border-dashed border-input p-3 bg-muted/10 space-y-2">
          <div className="flex items-center gap-3">
            {/* <Shield className="h-4 w-4 text-muted-foreground shrink-0" /> */}
            {/* <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">reCAPTCHA</p>
              <p className="text-xs text-muted-foreground">
                Google v2 &ldquo;I&apos;m not a robot&rdquo; checkbox. Blocks spam submissions.
              </p>
            </div> */}
          </div>
          <div className="h-[78px] w-[304px] rounded border bg-background flex items-center px-3 gap-2 text-xs text-muted-foreground select-none pointer-events-none">
            <div className="h-6 w-6 border border-input rounded bg-background" />
            <span>I&apos;m not a robot</span>
            <span className="ml-auto text-[10px] opacity-50">reCAPTCHA</span>
          </div>
        </div>
      );
    case 'COUNTRY':
      return <CountryPreview displayLabel={displayLabel} />;

    default:
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{displayLabel}</p>
          <div className="h-10 rounded-md border border-input bg-background" />
        </div>
      );
  }
}

export function FormBlockRenderer({ node, deleteNode, editor, getPos }: NodeViewProps) {
  const { selectedFieldId, onSelectField, validationErrorIds } = useEditorSelection();
  const [insertOpen, setInsertOpen] = useState(false);

  const attrs = node.attrs;
  const fieldId = attrs.fieldId as string;
  const fieldType = attrs.fieldType as FieldType;
  const config = FIELD_TYPE_CONFIG[fieldType];
  const Icon = FIELD_ICON_MAP[config?.icon] ?? Type;

  const isSelected = selectedFieldId === fieldId;
  const hasError = validationErrorIds.has(fieldId);

  const {
    setNodeRef,
    listeners,
    attributes: sortableAttributes,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldId });

  // PAGE_BREAK labels need to show their position among all page breaks in
  // the document, so they must re-render when siblings change. Other block
  // types already re-render on their own attr changes via the NodeView.
  const [docTick, setDocTick] = useState(0);
  useEffect(() => {
    if (fieldType !== 'PAGE_BREAK') return;
    const handler = () => setDocTick((t) => t + 1);
    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    };
  }, [editor, fieldType]);

  const pageIndex = useMemo(() => {
    if (fieldType !== 'PAGE_BREAK') return undefined;
    const pos = getPos() ?? 0;
    let count = 0;
    editor.state.doc.descendants((n, p) => {
      if (p >= pos) return false;
      if (n.type.name === 'formBlock' && n.attrs.fieldType === 'PAGE_BREAK') count++;
      return false;
    });
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, getPos, fieldType, docTick]);

  const sortableStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function handleInsertAfter(type: FieldType) {
    const insertConfig = FIELD_TYPE_CONFIG[type];
    if (!insertConfig) return;
    const pos = (getPos() ?? 0) + node.nodeSize;
    editor.chain().focus().insertContentAt(pos, buildInsertPayload(type, insertConfig.label)).run();
  }

  return (
    <NodeViewWrapper
      className="my-2 relative"
      ref={setNodeRef}
      style={sortableStyle}
      {...sortableAttributes}
    >
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
        <div className="flex items-center gap-1.5 mb-3">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{config?.label}</span>
          {hasError && (
            <span className="text-sm text-destructive font-medium ml-2">Needs attention</span>
          )}

          <div
            className={cn(
              'ml-auto flex items-center gap-0.5',
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteNode();
              }}
              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              aria-label="Delete field"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInsertOpen(true);
              }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"
              aria-label="Insert block after"
              title="Insert block"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted text-muted-foreground touch-none"
              aria-label="Drag to reorder"
              title="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <FieldPreview
          fieldType={fieldType}
          label={attrs.label as string}
          placeholder={attrs.placeholder as string | null}
          required={attrs.required as boolean}
          options={attrs.options as string | null}
          pageIndex={pageIndex}
        />
      </div>

      <InsertBlockDialog
        open={insertOpen}
        onOpenChange={setInsertOpen}
        onSelect={handleInsertAfter}
      />
    </NodeViewWrapper>
  );
}
