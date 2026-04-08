import { z } from 'zod';

const fieldTypeEnum = z.enum([
  'SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'NUMBER', 'PHONE', 'URL', 'DATE',
  'DROPDOWN', 'MULTI_SELECT', 'CHECKBOX', 'RADIO', 'FILE_UPLOAD',
  'RATING', 'SCALE', 'STATEMENT', 'PAGE_BREAK',
]);

export const createFormSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    slug: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
  }),
});

export const updateFormSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    settings: z.record(z.unknown()).optional(),
  }),
});

export const formFieldsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
  }),
  body: z.object({
    fields: z.array(
      z.object({
        id: z.string().optional(),
        type: fieldTypeEnum,
        label: z.string().min(1).max(500),
        description: z.string().max(1000).optional(),
        placeholder: z.string().max(500).optional(),
        required: z.boolean().default(false),
        order: z.number().int().min(0),
        options: z.unknown().optional(),
        validations: z.unknown().optional(),
        conditionals: z.unknown().optional(),
      }),
    ),
  }),
});

export const updateFormStatusSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']),
  }),
});

export const formParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
  }),
});

export const formListSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  }),
});

export const trashParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});
