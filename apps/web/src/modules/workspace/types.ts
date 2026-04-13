export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type Plan = 'FREE' | 'PRO' | 'BUSINESS';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

// Composite types matching API responses
export type WorkspaceWithRole = Workspace & { role: WorkspaceRole };
export type WorkspaceWithMembers = Workspace & { members: WorkspaceMember[] };

// Service input types (Keys)
export interface CreateWorkspaceKeys {
  name: string;
  slug?: string;
}

export interface UpdateWorkspaceKeys {
  id: string;
  data: { name?: string; slug?: string };
}

export interface DeleteWorkspaceKeys {
  id: string;
}

export interface InviteMemberKeys {
  workspaceId: string;
  data: { email: string; role: WorkspaceRole };
}

export interface UpdateMemberRoleKeys {
  workspaceId: string;
  memberId: string;
  data: { role: WorkspaceRole };
}

export interface RemoveMemberKeys {
  workspaceId: string;
  memberId: string;
}

export interface UsageMetric {
  current: number;
  limit: number | null;
}

export interface WorkspaceUsage {
  plan: Plan;
  forms: UsageMetric;
  submissionsThisMonth: UsageMetric;
  members: UsageMetric;
  workspacesOwned: UsageMetric;
}

export interface GetWorkspaceUsageKeys {
  workspaceId: string;
}
