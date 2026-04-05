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

// Service input types (Keys)
export interface GetFormBySlugKeys {
  slug: string;
}

export interface ListFormsKeys {
  workspaceId: string;
  params?: { page?: number; limit?: number; status?: FormStatus };
}

export interface GetFormKeys {
  workspaceId: string;
  formId: string;
}

export interface CreateFormKeys {
  workspaceId: string;
  data: { title: string; description?: string; slug?: string };
}

export interface UpdateFormKeys {
  workspaceId: string;
  formId: string;
  data: { title?: string; description?: string; settings?: object };
}

export interface UpdateFormStatusKeys {
  workspaceId: string;
  formId: string;
  data: { status: FormStatus };
}

export interface UpdateFormFieldsKeys {
  workspaceId: string;
  formId: string;
  fields: Omit<FormField, 'formId' | 'createdAt' | 'updatedAt'>[];
}

export interface DeleteFormKeys {
  workspaceId: string;
  formId: string;
}
