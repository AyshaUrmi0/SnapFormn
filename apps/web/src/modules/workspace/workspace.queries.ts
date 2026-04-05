'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/constants/query-keys';
import { getErrorMessage } from '@/lib/errors';
import {
  listWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
} from './workspace.service';
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

// ─── Queries ─────────────────────────────────────────────────

export const useWorkspaces = () => {
  return useQuery<WorkspaceWithRole[], Error>({
    queryKey: queryKeys.workspaces.all(),
    queryFn: () => listWorkspaces(),
  });
};

export const useWorkspace = (id: string) => {
  return useQuery<WorkspaceWithMembers, Error>({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: () => getWorkspace(id),
    enabled: !!id,
  });
};

// ─── Mutations ───────────────────────────────────────────────

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, CreateWorkspaceKeys>({
    mutationFn: (params: CreateWorkspaceKeys) => createWorkspace(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
      toast.success('Workspace created!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, UpdateWorkspaceKeys>({
    mutationFn: (params: UpdateWorkspaceKeys) => updateWorkspace(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(data.id) });
      toast.success('Workspace updated!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteWorkspaceKeys>({
    mutationFn: (params: DeleteWorkspaceKeys) => deleteWorkspace(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
      toast.success('Workspace deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceMember, Error, InviteMemberKeys>({
    mutationFn: (params: InviteMemberKeys) => inviteMember(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.members(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.detail(variables.workspaceId),
      });
      toast.success('Member invited!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceMember, Error, UpdateMemberRoleKeys>({
    mutationFn: (params: UpdateMemberRoleKeys) => updateMemberRole(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.members(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.detail(variables.workspaceId),
      });
      toast.success('Member role updated!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveMemberKeys>({
    mutationFn: (params: RemoveMemberKeys) => removeMember(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.members(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.detail(variables.workspaceId),
      });
      toast.success('Member removed.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
