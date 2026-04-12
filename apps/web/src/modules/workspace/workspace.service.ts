import { createApi, methodsEnums } from '@/lib/createApi';
import type {
  Workspace,
  WorkspaceWithRole,
  WorkspaceWithMembers,
  WorkspaceMember,
  CreateWorkspaceKeys,
  UpdateWorkspaceKeys,
  DeleteWorkspaceKeys,
  InviteMemberKeys,
  UpdateMemberRoleKeys,
  RemoveMemberKeys,
} from './types';

const { GET, POST, PATCH, DELETE } = methodsEnums;

// ─── Workspace CRUD ──────────────────────────────────────────

function listWorkspacesRequest() {
  return { url: '/workspaces', method: GET };
}

export const listWorkspaces = createApi<void, WorkspaceWithRole[]>({
  request: listWorkspacesRequest,
});

function getWorkspaceRequest(id: string) {
  return { url: `/workspaces/${id}`, method: GET };
}

export const getWorkspace = createApi<string, WorkspaceWithMembers>({
  request: getWorkspaceRequest,
});

function createWorkspaceRequest(data: CreateWorkspaceKeys) {
  return { url: '/workspaces', method: POST, data };
}

export const createWorkspace = createApi<CreateWorkspaceKeys, Workspace>({
  request: createWorkspaceRequest,
});

function updateWorkspaceRequest({ id, data }: UpdateWorkspaceKeys) {
  return { url: `/workspaces/${id}`, method: PATCH, data };
}

export const updateWorkspace = createApi<UpdateWorkspaceKeys, Workspace>({
  request: updateWorkspaceRequest,
});

function deleteWorkspaceRequest({ id }: DeleteWorkspaceKeys) {
  return { url: `/workspaces/${id}`, method: DELETE };
}

export const deleteWorkspace = createApi<DeleteWorkspaceKeys, void>({
  request: deleteWorkspaceRequest,
});

// ─── Members ─────────────────────────────────────────────────

function inviteMemberRequest({ workspaceId, data }: InviteMemberKeys) {
  return { url: `/workspaces/${workspaceId}/members`, method: POST, data };
}

export const inviteMember = createApi<InviteMemberKeys, WorkspaceMember>({
  request: inviteMemberRequest,
});

function updateMemberRoleRequest({ workspaceId, memberId, data }: UpdateMemberRoleKeys) {
  return { url: `/workspaces/${workspaceId}/members/${memberId}`, method: PATCH, data };
}

export const updateMemberRole = createApi<UpdateMemberRoleKeys, WorkspaceMember>({
  request: updateMemberRoleRequest,
});

function removeMemberRequest({ workspaceId, memberId }: RemoveMemberKeys) {
  return { url: `/workspaces/${workspaceId}/members/${memberId}`, method: DELETE };
}

export const removeMember = createApi<RemoveMemberKeys, void>({
  request: removeMemberRequest,
});
