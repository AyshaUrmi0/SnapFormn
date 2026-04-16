import { z } from 'zod';

export const submitFormSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
  body: z.object({
    fields: z.array(
      z.object({
        fieldId: z.string().min(1),
        value: z.unknown(),
      }),
    ),
    // Only present when the form contains a RECAPTCHA block. The backend
    // verifies this token with Google before accepting the submission.
    recaptchaToken: z.string().optional(),
  }),
});

export const listSubmissionsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const analyticsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
  }),
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).default(30),
  }),
});

export const submissionParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    formId: z.string().min(1),
    submissionId: z.string().min(1),
  }),
});
