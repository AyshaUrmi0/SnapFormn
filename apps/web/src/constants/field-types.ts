import type { FieldType } from '@/modules/form/types';

export type FieldCategory = 'questions' | 'layout' | 'embed' | 'advanced';

interface FieldTypeConfig {
  label: string;
  icon: string;
  category: FieldCategory;
}

export const FIELD_TYPE_CONFIG: Record<FieldType, FieldTypeConfig> = {
  // ─── Questions ───────────────────────────────────────────
  SHORT_TEXT: { label: 'Short answer', icon: 'Type', category: 'questions' },
  LONG_TEXT: { label: 'Long answer', icon: 'AlignLeft', category: 'questions' },
  RADIO: { label: 'Multiple choice', icon: 'Circle', category: 'questions' },
  CHECKBOX: { label: 'Checkboxes', icon: 'CheckSquare', category: 'questions' },
  DROPDOWN: { label: 'Dropdown', icon: 'ChevronDown', category: 'questions' },
  MULTI_SELECT: { label: 'Multi-select', icon: 'ListChecks', category: 'questions' },
  NUMBER: { label: 'Number', icon: 'Hash', category: 'questions' },
  EMAIL: { label: 'Email', icon: 'Mail', category: 'questions' },
  PHONE: { label: 'Phone number', icon: 'Phone', category: 'questions' },
  URL: { label: 'Link', icon: 'Link', category: 'questions' },
  FILE_UPLOAD: { label: 'File upload', icon: 'Upload', category: 'questions' },
  DATE: { label: 'Date', icon: 'Calendar', category: 'questions' },
  TIME: { label: 'Time', icon: 'Clock', category: 'questions' },
  SCALE: { label: 'Linear scale', icon: 'SlidersHorizontal', category: 'questions' },
  MATRIX: { label: 'Matrix', icon: 'Grid3x3', category: 'questions' },
  RATING: { label: 'Rating', icon: 'Star', category: 'questions' },
  SIGNATURE: { label: 'Signature', icon: 'PenLine', category: 'questions' },
  RANKING: { label: 'Ranking', icon: 'ListOrdered', category: 'questions' },

  // ─── Layout ──────────────────────────────────────────────
  PAGE_BREAK: { label: 'New page', icon: 'Minus', category: 'layout' },
  THANK_YOU_PAGE: { label: "'Thank you' page", icon: 'CheckCircle2', category: 'layout' },
  STATEMENT: { label: 'Text', icon: 'MessageSquare', category: 'layout' },
  HEADING_1: { label: 'Heading 1', icon: 'Heading1', category: 'layout' },
  HEADING_2: { label: 'Heading 2', icon: 'Heading2', category: 'layout' },
  HEADING_3: { label: 'Heading 3', icon: 'Heading3', category: 'layout' },
  DIVIDER: { label: 'Divider', icon: 'Minus', category: 'layout' },
  TITLE: { label: 'Title', icon: 'Heading', category: 'layout' },
  LABEL: { label: 'Label', icon: 'Tag', category: 'layout' },

  // ─── Embed blocks ────────────────────────────────────────
  IMAGE: { label: 'Image', icon: 'Image', category: 'embed' },
  VIDEO: { label: 'Video', icon: 'Video', category: 'embed' },
  AUDIO: { label: 'Audio', icon: 'Music', category: 'embed' },
  EMBED: { label: 'Embed anything', icon: 'Code', category: 'embed' },

  // ─── Advanced blocks ─────────────────────────────────────
  CONDITIONAL_LOGIC: { label: 'Conditional logic', icon: 'GitBranch', category: 'advanced' },
  CALCULATED: { label: 'Calculated fields', icon: 'Calculator', category: 'advanced' },
  HIDDEN: { label: 'Hidden fields', icon: 'EyeOff', category: 'advanced' },
  RECAPTCHA: { label: 'reCAPTCHA', icon: 'Shield', category: 'advanced' },
  COUNTRY: { label: "Respondent's country", icon: 'Globe', category: 'advanced' },
};

// Order matters — the slash-command picker iterates in this order.
export const FIELD_TYPE_CATEGORIES: Record<FieldCategory, string> = {
  questions: 'Questions',
  layout: 'Layout blocks',
  embed: 'Embed blocks',
  advanced: 'Advanced blocks',
};
