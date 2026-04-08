import type { JSONContent } from '@tiptap/core';
import type { EditorField, FieldOption } from './types';
import { CHOICE_FIELD_TYPES } from './types';
import type { FieldType } from '@/modules/form/types';

/**
 * Convert an array of EditorField to a TipTap document JSON.
 * Each field becomes a formBlock node; empty spaces between become paragraphs.
 */
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

  // Add a trailing paragraph so the user can type after the last block
  content.push({ type: 'paragraph' });

  return { type: 'doc', content };
}

/**
 * Extract EditorField[] from a TipTap document JSON.
 * Walks all top-level nodes and picks out formBlock nodes.
 */
export function docToEditorFields(doc: JSONContent): EditorField[] {
  const nodes = doc.content ?? [];
  const fields: EditorField[] = [];
  let order = 0;

  for (const node of nodes) {
    if (node.type === 'formBlock' && node.attrs) {
      let options: FieldOption[] | null = null;
      try {
        const parsed = JSON.parse((node.attrs.options as string) || '[]');
        if (Array.isArray(parsed)) {
          options = parsed.filter(
            (o: any) => typeof o.label === 'string' && typeof o.value === 'string',
          );
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
