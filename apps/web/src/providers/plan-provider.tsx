'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listWorkspaces } from '@/modules/workspace/workspace.service';
import { queryKeys } from '@/constants/query-keys';
import type { Plan, WorkspaceWithRole } from '@/modules/workspace/types';

interface PlanContextValue {
  /** All workspaces the user belongs to */
  workspaces: WorkspaceWithRole[] | undefined;
  /** Get the plan for a given workspace, defaults to FREE if not found */
  getPlan: (workspaceId: string) => Plan;
  /** True if the workspace is on the FREE plan */
  isFree: (workspaceId: string) => boolean;
  /** True if the workspace is on a paid plan (PRO or BUSINESS) */
  isPaid: (workspaceId: string) => boolean;
  /** True if the user owns at least one FREE workspace */
  hasFreeOwnedWorkspace: boolean;
  /** Force a refresh of the plan/workspace data (use after returning from Stripe) */
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Always-fresh source of truth for plans. staleTime=0 means it refetches
  // on every mount and on window focus, so plan changes from Stripe webhooks
  // are picked up immediately when the user returns to the app.
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

    return {
      workspaces,
      getPlan: findPlan,
      isFree: (id: string) => findPlan(id) === 'FREE',
      isPaid: (id: string) => {
        const plan = findPlan(id);
        return plan === 'PRO' || plan === 'BUSINESS';
      },
      hasFreeOwnedWorkspace: !!workspaces?.some(
        (w) => w.plan === 'FREE' && w.role === 'OWNER',
      ),
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
