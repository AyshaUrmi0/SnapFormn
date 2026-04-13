import { z } from 'zod';

export const signUploadSchema = z.object({
  body: z.object({
    formId: z.string().min(1),
    fieldId: z.string().min(1),
    resourceType: z.enum(['image', 'video', 'raw', 'auto']).default('auto'),
  }),
});

export const signPublicUploadSchema = z.object({
  body: z.object({
    slug: z.string().min(1),
    fieldId: z.string().min(1),
    resourceType: z.enum(['image', 'video', 'raw', 'auto']).default('auto'),
  }),
});
