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
