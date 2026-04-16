import type { FormField } from '@/modules/form/types';

/**
 * Expand `@fieldName` tokens in a string against the current values map.
 *
 * The token matches any field whose label (trimmed, case-insensitive) equals
 * the text after the `@`. If no match, the raw token is left in place so the
 * creator can see they wrote something that didn't resolve.
 *
 * Limited to labels with letters, digits, "_", "-", and "." — keeps the regex
 * predictable and avoids accidental collisions with emails or @-mentions in
 * unrelated text. In other words: `@price` pipes; `support@example.com` does not.
 */
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

/**
 * Return the list of field labels that can be referenced via @mention.
 * Today only CALCULATED fields are exposed as mention sources — they hold
 * the derived values that Tally-style forms most often need to display.
 */
export function mentionableFields(fields: FormField[] | { id: string; label: string; type: string }[]): Array<{ id: string; label: string }> {
  return fields
    .filter((f) => (f as { type: string }).type === 'CALCULATED')
    .map((f) => ({ id: f.id, label: f.label }))
    .filter((f) => f.label && f.label.trim().length > 0);
}
