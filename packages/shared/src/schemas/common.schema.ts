import { z } from 'zod';

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});
