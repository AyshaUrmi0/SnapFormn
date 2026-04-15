import type { JSONContent } from '@tiptap/core';
import type { EditorField, EditorFieldOptions } from './types';
import { CHOICE_FIELD_TYPES } from './types';
import type { FieldType } from '@/modules/form/types';

export function editorFieldsToDoc(fields: EditorField[]): JSONContent {
  if (fields.length === 0) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  const content: JSONContent[] = fields.map((field) => ({
    type: 'formBlock',
    attrs: {
      fieldId: field.id,
      fieldType: field.type,
      label: field.label,
      description: field.description,
      placeholder: field.placeholder,
      required: field.required,
      options: JSON.stringify(field.options ?? []),
    },
  }));

  content.push({ type: 'paragraph' });

  return { type: 'doc', content };
}

export function docToEditorFields(doc: JSONContent): EditorField[] {
  const nodes = doc.content ?? [];
  const fields: EditorField[] = [];
  let order = 0;

  for (const node of nodes) {
    if (node.type === 'formBlock' && node.attrs) {
      let options: EditorFieldOptions = null;
      try {
        const parsed = JSON.parse((node.attrs.options as string) || 'null');
        if (Array.isArray(parsed)) {
          options = parsed.filter(
            (o: any) => typeof o === 'object' && o !== null && typeof o.label === 'string' && typeof o.value === 'string',
          );
        } else if (parsed && typeof parsed === 'object') {
          options = parsed as Record<string, unknown>;
        }
      } catch {
        options = null;
      }

      const fieldType = node.attrs.fieldType as FieldType;
      if (!options && CHOICE_FIELD_TYPES.includes(fieldType)) {
        options = [];
      }

      fields.push({
        id: node.attrs.fieldId as string,
        type: fieldType,
        label: (node.attrs.label as string) ?? '',
        description: (node.attrs.description as string) ?? null,
        placeholder: (node.attrs.placeholder as string) ?? null,
        required: (node.attrs.required as boolean) ?? false,
        order,
        options,
        validations: null,
        conditionals: null,
      });
      order++;
    }
  }

  return fields;
}
