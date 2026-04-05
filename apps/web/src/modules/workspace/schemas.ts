import { z } from 'zod';

const slugRegex = /^[a-z0-9-]+$/;
const slugMessage = 'Slug must be lowercase alphanumeric with hyphens only';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  slug: z.string().regex(slugRegex, slugMessage).max(100).optional().or(z.literal('')),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  slug: z.string().regex(slugRegex, slugMessage).max(100).optional().or(z.literal('')),
});

export const inviteMemberSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER'], { required_error: 'Role is required' }),
});

export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceValues = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
