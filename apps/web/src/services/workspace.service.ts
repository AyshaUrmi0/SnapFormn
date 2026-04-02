import { api } from '@/lib/api-client';
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types/workspace';

export const workspaceService = {
  list: () => api.get<Workspace[]>('/workspaces'),

  get: (id: string) => api.get<Workspace>(`/workspaces/${id}`),

  create: (data: { name: string; slug?: string }) =>
    api.post<Workspace>('/workspaces', data),

  update: (id: string, data: { name?: string; slug?: string }) =>
    api.patch<Workspace>(`/workspaces/${id}`, data),

  delete: (id: string) => api.del<void>(`/workspaces/${id}`),

  // Members
  inviteMember: (workspaceId: string, data: { email: string; role: WorkspaceRole }) =>
    api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, data),

  updateMemberRole: (workspaceId: string, memberId: string, data: { role: WorkspaceRole }) =>
    api.patch<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, data),

  removeMember: (workspaceId: string, memberId: string) =>
    api.del<void>(`/workspaces/${workspaceId}/members/${memberId}`),
};
