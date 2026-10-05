import type { FieldType, FormField } from '@/modules/form/types';

export interface FieldOption {
  label: string;
  value: string;
}

export interface MediaOptions {
  src?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export interface ScaleOptions {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface MatrixOptions {
  rows: FieldOption[];
  columns: FieldOption[];
}

export type EditorFieldOptions = FieldOption[] | Record<string, unknown> | null;

export interface EditorField {
  id: string;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: EditorFieldOptions;
  validations: Record<string, unknown> | null;
  conditionals: Record<string, unknown> | null;
}

export const CHOICE_FIELD_TYPES: FieldType[] = ['DROPDOWN', 'MULTI_SELECT', 'CHECKBOX', 'RADIO', 'RANKING'];
export const MEDIA_FIELD_TYPES: FieldType[] = ['IMAGE', 'VIDEO', 'AUDIO', 'EMBED'];

export function getChoiceOptions(field: EditorField): FieldOption[] {
  if (Array.isArray(field.options)) return field.options as FieldOption[];
  return [];
}

export function getMediaOptions(field: EditorField): MediaOptions {
  if (field.options && !Array.isArray(field.options) && typeof field.options === 'object') {
    return field.options as MediaOptions;
  }
  return {};
}

export function getMatrixOptions(field: EditorField): MatrixOptions {
  const empty: MatrixOptions = { rows: [], columns: [] };
  const opts = field.options;
  if (!opts || Array.isArray(opts) || typeof opts !== 'object') return empty;
  const o = opts as Record<string, unknown>;
  const parseList = (raw: unknown): FieldOption[] => {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (x): x is FieldOption =>
          typeof x === 'object' && x !== null &&
          typeof (x as FieldOption).label === 'string' &&
          typeof (x as FieldOption).value === 'string',
      )
      .map((x) => ({ label: x.label, value: x.value }));
  };
  return { rows: parseList(o.rows), columns: parseList(o.columns) };
}

export function getScaleOptions(field: { options: unknown }): ScaleOptions {
  const opts = field.options;
  if (opts && !Array.isArray(opts) && typeof opts === 'object') {
    const o = opts as Record<string, unknown>;
    const min = typeof o.min === 'number' ? o.min : null;
    const max = typeof o.max === 'number' ? o.max : null;
    if (min !== null && max !== null && max > min) {
      return {
        min,
        max,
        minLabel: typeof o.minLabel === 'string' ? o.minLabel : undefined,
        maxLabel: typeof o.maxLabel === 'string' ? o.maxLabel : undefined,
      };
    }
  }
  return { min: 1, max: 10 };
}

export function toEditorField(field: FormField): EditorField {
  let options: EditorFieldOptions = null;
  if (Array.isArray(field.options)) {
    options = (field.options as { label?: string; value?: string }[])
      .filter((o) => typeof o.label === 'string' && typeof o.value === 'string')
      .map((o) => ({ label: o.label as string, value: o.value as string }));
  } else if (field.options && typeof field.options === 'object') {
    options = field.options as Record<string, unknown>;
  }

  return {
    id: field.id,
    type: field.type,
    label: field.label,
    description: field.description,
    placeholder: field.placeholder,
    required: field.required,
    order: field.order,
    options,
    validations: field.validations as Record<string, unknown> | null,
    conditionals: field.conditionals as Record<string, unknown> | null,
  };
}
