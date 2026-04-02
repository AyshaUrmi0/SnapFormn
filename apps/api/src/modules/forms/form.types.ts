import type { FieldType, FormStatus } from '@prisma/client';

export interface CreateFormInput {
  title: string;
  description?: string;
  slug?: string;
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  settings?: object;
}

export interface FormFieldInput {
  id?: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: unknown;
  validations?: unknown;
  conditionals?: unknown;
}

export interface UpdateFormStatusInput {
  status: FormStatus;
}
