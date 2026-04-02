import { api } from '@/lib/api-client';
import type { Form, FormField, FormStatus } from '@/types/form';
import type { PaginationParams } from '@/types/api';

export const formService = {
  // Public
  getBySlug: (slug: string) => api.get<Form & { fields: FormField[] }>(`/forms/${slug}`),

  // Workspace-scoped
  list: (workspaceId: string, params?: PaginationParams & { status?: FormStatus }) =>
    api.get<Form[]>(`/forms/workspace/${workspaceId}`, { params: params as Record<string, string | number | undefined> }),

  get: (workspaceId: string, formId: string) =>
    api.get<Form & { fields: FormField[] }>(`/forms/workspace/${workspaceId}/${formId}`),

  create: (workspaceId: string, data: { title: string; description?: string; slug?: string }) =>
    api.post<Form>(`/forms/workspace/${workspaceId}`, data),

  update: (workspaceId: string, formId: string, data: { title?: string; description?: string; settings?: object }) =>
    api.patch<Form>(`/forms/workspace/${workspaceId}/${formId}`, data),

  updateStatus: (workspaceId: string, formId: string, data: { status: FormStatus }) =>
    api.patch<Form>(`/forms/workspace/${workspaceId}/${formId}/status`, data),

  updateFields: (workspaceId: string, formId: string, fields: Omit<FormField, 'formId' | 'createdAt' | 'updatedAt'>[]) =>
    api.put<FormField[]>(`/forms/workspace/${workspaceId}/${formId}/fields`, { fields }),

  delete: (workspaceId: string, formId: string) =>
    api.del<void>(`/forms/workspace/${workspaceId}/${formId}`),
};
