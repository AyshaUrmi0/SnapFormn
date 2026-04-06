import { z } from 'zod';

export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
});

export const updateFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateFormValues = z.infer<typeof createFormSchema>;
export type UpdateFormValues = z.infer<typeof updateFormSchema>;
