import { CHOICE_FIELD_TYPES } from './types';
import type { EditorField } from './types';

export interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  message: string;
}

export function validateFields(fields: EditorField[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const fieldLabel = field.label || `Field #${field.order + 1}`;

    // All fields except PAGE_BREAK need a label
    if (field.type !== 'PAGE_BREAK' && !field.label.trim()) {
      errors.push({
        fieldId: field.id,
        fieldLabel,
        message: 'Label is required',
      });
    }

    // Choice fields need at least 1 option with a non-empty label
    if (CHOICE_FIELD_TYPES.includes(field.type)) {
      const validOptions = (field.options ?? []).filter((o) => o.label.trim());
      if (validOptions.length === 0) {
        errors.push({
          fieldId: field.id,
          fieldLabel,
          message: 'At least one option is required',
        });
      }
    }
  }

  return errors;
}
