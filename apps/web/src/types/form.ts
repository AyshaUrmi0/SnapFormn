export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'EMAIL'
  | 'NUMBER'
  | 'PHONE'
  | 'URL'
  | 'DATE'
  | 'DROPDOWN'
  | 'MULTI_SELECT'
  | 'CHECKBOX'
  | 'RADIO'
  | 'FILE_UPLOAD'
  | 'RATING'
  | 'SCALE'
  | 'STATEMENT'
  | 'PAGE_BREAK';

export interface FormField {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  description: string | null;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: unknown;
  validations: unknown;
  conditionals: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Form {
  id: string;
  workspaceId: string;
  createdById: string;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;
  settings: Record<string, unknown>;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fields?: FormField[];
  _count?: {
    submissions: number;
  };
}
