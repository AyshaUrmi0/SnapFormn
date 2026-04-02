import { api } from '@/lib/api-client';
import type { Submission } from '@/types/submission';
import type { PaginationParams } from '@/types/api';

export const submissionService = {
  // Public
  submit: (slug: string, data: { fields: Array<{ fieldId: string; value: unknown }> }) =>
    api.post<Submission>(`/submissions/${slug}`, data),

  // Workspace-scoped
  list: (workspaceId: string, formId: string, params?: PaginationParams) =>
    api.get<Submission[]>(`/submissions/workspace/${workspaceId}/forms/${formId}`, {
      params: params as Record<string, string | number | undefined>,
    }),

  get: (workspaceId: string, formId: string, submissionId: string) =>
    api.get<Submission>(`/submissions/workspace/${workspaceId}/forms/${formId}/${submissionId}`),

  delete: (workspaceId: string, formId: string, submissionId: string) =>
    api.del<void>(`/submissions/workspace/${workspaceId}/forms/${formId}/${submissionId}`),
};
