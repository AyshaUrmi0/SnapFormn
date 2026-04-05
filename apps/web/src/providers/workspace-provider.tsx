'use client';

import { createContext, useContext, useMemo } from 'react';
import { useWorkspace } from '@/modules/workspace/workspace.queries';
import { useAuth } from '@/hooks/use-auth';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import type { WorkspaceWithMembers, WorkspaceRole } from '@/modules/workspace/types';
import type { Permission } from '@snapform/shared';

interface WorkspaceContextValue {
  workspace: WorkspaceWithMembers;
  currentUserRole: WorkspaceRole;
  currentUserPermissions: Permission[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { data: workspace, isLoading, isError, error, refetch } = useWorkspace(workspaceId);

  const value = useMemo<WorkspaceContextValue | null>(() => {
    if (!workspace || !user) return null;

    const membership = workspace.members.find((m) => m.userId === user.id);
    const currentUserRole: WorkspaceRole = membership?.role ?? 'VIEWER';
    const currentUserPermissions = (ROLE_PERMISSIONS[currentUserRole] ?? []) as Permission[];

    return { workspace, currentUserRole, currentUserPermissions };
  }, [workspace, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState message="Loading workspace..." />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState
          message={error?.message ?? 'Workspace not found'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!value) return null;

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
}
