import type { FormField } from '@/modules/form/types';

const MENTION_RE = /@([A-Za-z][A-Za-z0-9_.-]*)/g;

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
  }
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join(', ');
  try {
    return String(value);
  } catch {
    return '';
  }
}

export function expandMentions(
  text: string | null | undefined,
  fields: FormField[] | { id: string; label: string }[],
  values: Record<string, unknown>,
): string {
  if (!text) return '';
  const byName = new Map<string, string>();
  for (const f of fields) {
    const name = (f.label ?? '').trim().toLowerCase();
    if (!name) continue;
    if (!byName.has(name)) byName.set(name, f.id);
  }
  return text.replace(MENTION_RE, (match, rawName: string) => {
    const id = byName.get(rawName.toLowerCase());
    if (!id) return match;
    const val = values[id];
    const formatted = formatValue(val);
    return formatted || match;
  });
}

export function mentionableFields(fields: FormField[] | { id: string; label: string; type: string }[]): Array<{ id: string; label: string }> {
  return fields
    .filter((f) => (f as { type: string }).type === 'CALCULATED')
    .map((f) => ({ id: f.id, label: f.label }))
    .filter((f) => f.label && f.label.trim().length > 0);
}
