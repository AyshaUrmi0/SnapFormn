import type { FieldType, FormField } from '@/modules/form/types';

export interface FieldOption {
  label: string;
  value: string;
}

export interface EditorField {
  id: string;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
  validations: Record<string, unknown> | null;
  conditionals: Record<string, unknown> | null;
}

export const CHOICE_FIELD_TYPES: FieldType[] = ['DROPDOWN', 'MULTI_SELECT', 'CHECKBOX', 'RADIO'];

export function toEditorField(field: FormField): EditorField {
  let options: FieldOption[] | null = null;
  if (Array.isArray(field.options)) {
    options = (field.options as { label?: string; value?: string }[])
      .filter((o) => typeof o.label === 'string' && typeof o.value === 'string')
      .map((o) => ({ label: o.label as string, value: o.value as string }));
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
