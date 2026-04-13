'use client';

import { useWorkspaceUsage } from '@/modules/workspace/workspace.queries';
import { usePlan } from '@/providers/plan-provider';
import { ROUTES } from '@/constants/routes';

/**
 * Returns the href for the "Create form" action.
 *
 * - If the workspace is on a paid plan → returns the normal NEW_FORM route
 * - If the workspace is FREE and at the form limit → returns the workspace's upgrade page
 * - Otherwise → returns the normal NEW_FORM route
 */
export function useCreateFormHref(workspaceId: string): string {
  const { isPaid } = usePlan();
  const { data: usage } = useWorkspaceUsage(workspaceId);

  // Paid plans always go to the create page (no form limit)
  if (workspaceId && isPaid(workspaceId)) {
    return ROUTES.workspace(workspaceId).NEW_FORM;
  }

  // Free plan: gate based on usage if available
  if (!usage) return ROUTES.workspace(workspaceId).NEW_FORM;
  if (usage.forms.limit !== null && usage.forms.current >= usage.forms.limit) {
    return `${ROUTES.workspace(workspaceId).UPGRADE}?reason=forms`;
  }
  return ROUTES.workspace(workspaceId).NEW_FORM;
}

/**
 * Returns the href for the "Create workspace" action.
 *
 * - If the user can create more workspaces (paid plan, or under free limit) →
 *   returns the normal NEW_WORKSPACE route
 * - Otherwise (free user already at the workspace limit) → returns the
 *   first owned workspace's upgrade page so they can upgrade it
 */
export function useCreateWorkspaceHref(): string {
  const { canCreateWorkspace, workspaces } = usePlan();

  if (canCreateWorkspace) return ROUTES.NEW_WORKSPACE;

  // Free user at workspace limit → send them to upgrade their existing workspace
  const firstOwned = workspaces?.find((w) => w.role === 'OWNER');
  if (firstOwned) {
    return `${ROUTES.workspace(firstOwned.id).UPGRADE}?reason=workspaces`;
  }
  return ROUTES.NEW_WORKSPACE;
}
