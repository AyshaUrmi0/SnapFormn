import type { FieldType } from '@/modules/form/types';

interface FieldTypeConfig {
  label: string;
  icon: string;
  category: 'text' | 'choice' | 'special' | 'layout';
}

export const FIELD_TYPE_CONFIG: Record<FieldType, FieldTypeConfig> = {
  SHORT_TEXT: { label: 'Short Text', icon: 'Type', category: 'text' },
  LONG_TEXT: { label: 'Long Text', icon: 'AlignLeft', category: 'text' },
  EMAIL: { label: 'Email', icon: 'Mail', category: 'text' },
  NUMBER: { label: 'Number', icon: 'Hash', category: 'text' },
  PHONE: { label: 'Phone', icon: 'Phone', category: 'text' },
  URL: { label: 'URL', icon: 'Link', category: 'text' },
  DATE: { label: 'Date', icon: 'Calendar', category: 'text' },
  DROPDOWN: { label: 'Dropdown', icon: 'ChevronDown', category: 'choice' },
  MULTI_SELECT: { label: 'Multi Select', icon: 'ListChecks', category: 'choice' },
  CHECKBOX: { label: 'Checkbox', icon: 'CheckSquare', category: 'choice' },
  RADIO: { label: 'Radio', icon: 'Circle', category: 'choice' },
  FILE_UPLOAD: { label: 'File Upload', icon: 'Upload', category: 'special' },
  RATING: { label: 'Rating', icon: 'Star', category: 'special' },
  SCALE: { label: 'Scale', icon: 'SlidersHorizontal', category: 'special' },
  STATEMENT: { label: 'Statement', icon: 'MessageSquare', category: 'layout' },
  PAGE_BREAK: { label: 'Page Break', icon: 'Minus', category: 'layout' },
};

export const FIELD_TYPE_CATEGORIES = {
  text: 'Text & Input',
  choice: 'Choice',
  special: 'Special',
  layout: 'Layout',
} as const;
