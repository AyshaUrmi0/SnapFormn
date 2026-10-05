'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listWorkspaces } from '@/modules/workspace/workspace.service';
import { queryKeys } from '@/constants/query-keys';
import type { Plan, WorkspaceWithRole } from '@/modules/workspace/types';

interface PlanContextValue {
  workspaces: WorkspaceWithRole[] | undefined;
  getPlan: (workspaceId: string) => Plan;
  isFree: (workspaceId: string) => boolean;
  isPaid: (workspaceId: string) => boolean;
  hasPaidWorkspace: boolean;
  canCreateWorkspace: boolean;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: workspaces } = useQuery<WorkspaceWithRole[], Error>({
    queryKey: queryKeys.workspaces.all(),
    queryFn: () => listWorkspaces(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
  }, [queryClient]);

  const value = useMemo<PlanContextValue>(() => {
    const findPlan = (id: string): Plan =>
      workspaces?.find((w) => w.id === id)?.plan ?? 'FREE';

    const ownedWorkspaces = workspaces?.filter((w) => w.role === 'OWNER') ?? [];
    const hasPaidWorkspace = ownedWorkspaces.some(
      (w) => w.plan === 'PRO' || w.plan === 'BUSINESS',
    );

    const canCreateWorkspace =
      hasPaidWorkspace || ownedWorkspaces.length < 1 || !workspaces;

    return {
      workspaces,
      getPlan: findPlan,
      isFree: (id: string) => findPlan(id) === 'FREE',
      isPaid: (id: string) => {
        const plan = findPlan(id);
        return plan === 'PRO' || plan === 'BUSINESS';
      },
      hasPaidWorkspace,
      canCreateWorkspace,
      refresh,
    };
  }, [workspaces, refresh]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return ctx;
}
