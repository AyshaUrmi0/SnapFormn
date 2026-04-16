'use client';

import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FIELD_TYPE_CONFIG } from '@/constants/field-types';
import { FIELD_ICON_MAP } from '@/constants/icon-map';
import type { FormField, FieldType } from '@/modules/form/types';
import type { Submission, SubmissionField } from '@/modules/submission/types';

interface ResponsesTableProps {
  formTitle: string;
  fields: FormField[];
  submissions: Submission[];
}

// Field categories/types that don't collect any answer data and should
// never appear as a column in the responses table.
const NON_DATA_TYPES = new Set<FieldType>([
  'STATEMENT',
  'PAGE_BREAK',
  'THANK_YOU_PAGE',
  'HEADING_1',
  'HEADING_2',
  'HEADING_3',
  'DIVIDER',
  'TITLE',
  'LABEL',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'EMBED',
  'CONDITIONAL_LOGIC',
  'RECAPTCHA',
]);

function columnLabelFor(field: FormField): string {
  if (field.type === 'COUNTRY') return 'Country';
  if (field.type === 'HIDDEN') {
    // Prefer a creator-customized label; fall back to the URL parameter name;
    // finally fall back to a generic label. The slash-menu default label is
    // the plural "Hidden fields" which looks odd as a column header.
    const customLabel = field.label && field.label !== 'Hidden fields' ? field.label : '';
    if (customLabel) return customLabel;
    const opts = field.options as { paramName?: string } | null | undefined;
    const paramName = opts?.paramName?.trim();
    if (paramName) return paramName;
    return 'Hidden field';
  }
  return field.label || '(untitled)';
}

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(stringifyValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    // File uploads / signatures often store { url, name } — prefer name/url.
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === 'string') return obj.name;
    if (typeof obj.url === 'string') return obj.url;
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}

function displayCell(value: unknown): string {
  const s = stringifyValue(value);
  return s === '' ? '-' : s;
}

function escapeCsv(value: string): string {
  if (value === '') return '';
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(
  columns: Array<{ key: string; header: string }>,
  rows: Array<Record<string, string>>,
): string {
  const head = columns.map((c) => escapeCsv(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(row[c.key] ?? '')).join(','))
    .join('\n');
  return `${head}\n${body}`;
}

function slugifyFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'form'
  );
}

export function ResponsesTable({ formTitle, fields, submissions }: ResponsesTableProps) {
  const dataFields = useMemo(
    () =>
      [...fields]
        .filter((f) => !NON_DATA_TYPES.has(f.type))
        .sort((a, b) => a.order - b.order),
    [fields],
  );

  const sortedSubmissions = useMemo(
    () =>
      [...submissions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [submissions],
  );

  const rows = useMemo(() => {
    return sortedSubmissions.map((submission) => {
      const byFieldId = new Map<string, SubmissionField>();
      for (const sf of submission.fields ?? []) byFieldId.set(sf.fieldId, sf);

      const cells: Record<string, string> = {
        __submittedAt: formatSubmittedAt(submission.createdAt),
      };
      for (const field of dataFields) {
        cells[field.id] = displayCell(byFieldId.get(field.id)?.value);
      }
      return { id: submission.id, cells };
    });
  }, [sortedSubmissions, dataFields]);

  const handleDownload = () => {
    const columns = [
      { key: '__submittedAt', header: 'Submitted at' },
      ...dataFields.map((f) => ({ key: f.id, header: columnLabelFor(f) })),
    ];
    const csvRows = rows.map((r) => r.cells);
    const csv = buildCsv(columns, csvRows);

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugifyFilename(formTitle)}-responses-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const total = sortedSubmissions.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          {total} response{total !== 1 ? 's' : ''} in total
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={total === 0}
        >
          <Download className="h-4 w-4" />
          Download CSV file
        </Button>
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No responses yet.
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <ColumnHeader icon="Calendar" label="Submitted at" />
                </th>
                {dataFields.map((field) => {
                  const iconName = FIELD_TYPE_CONFIG[field.type]?.icon ?? 'Type';
                  return (
                    <th
                      key={field.id}
                      className="px-4 py-3 text-left whitespace-nowrap font-medium"
                    >
                      <ColumnHeader
                        icon={iconName}
                        label={columnLabelFor(field)}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {row.cells.__submittedAt}
                  </td>
                  {dataFields.map((field) => (
                    <td
                      key={field.id}
                      className="px-4 py-3 max-w-[280px] truncate"
                      title={row.cells[field.id]}
                    >
                      {row.cells[field.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ColumnHeader({ icon, label }: { icon: string; label: string }) {
  const Icon = FIELD_ICON_MAP[icon];
  return (
    <span className="inline-flex items-center gap-1.5">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span className="normal-case">{label}</span>
    </span>
  );
}
