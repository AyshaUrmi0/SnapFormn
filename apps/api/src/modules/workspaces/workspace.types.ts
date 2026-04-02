import type { WorkspaceRole } from '@prisma/client';

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
}

export interface InviteMemberInput {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateMemberRoleInput {
  role: WorkspaceRole;
}
