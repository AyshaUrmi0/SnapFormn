import { z } from 'zod';

export const createCheckoutSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
    plan: z.enum(['PRO', 'BUSINESS']),
  }),
});
