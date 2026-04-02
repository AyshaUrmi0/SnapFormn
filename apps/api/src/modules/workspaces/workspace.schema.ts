import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
      .optional(),
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
  body: z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    memberId: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  }),
});

export const workspaceParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const memberParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
    memberId: z.string().min(1),
  }),
});
