import { CHOICE_FIELD_TYPES, getChoiceOptions } from './types';
import type { EditorField } from './types';
import type { FieldType } from '@/modules/form/types';

export interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  message: string;
}

// Block types that don't require a label (layout, embed, decorative blocks)
const LABEL_OPTIONAL_TYPES: FieldType[] = [
  'PAGE_BREAK',
  'DIVIDER',
  'THANK_YOU_PAGE',
  'RECAPTCHA',
  'CONDITIONAL_LOGIC',
  'HIDDEN',
];

export function validateFields(fields: EditorField[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const fieldLabel = field.label || `Field #${field.order + 1}`;

    if (!LABEL_OPTIONAL_TYPES.includes(field.type) && !field.label.trim()) {
      errors.push({
        fieldId: field.id,
        fieldLabel,
        message: 'Label is required',
      });
    }

    // Choice fields need at least 1 option with a non-empty label
    if (CHOICE_FIELD_TYPES.includes(field.type)) {
      const validOptions = getChoiceOptions(field).filter((o) => o.label.trim());
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
