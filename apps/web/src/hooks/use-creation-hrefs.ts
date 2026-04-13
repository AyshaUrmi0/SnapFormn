'use client';

import { useWorkspaceUsage } from '@/modules/workspace/workspace.queries';
import { usePlan } from '@/providers/plan-provider';
import { ROUTES } from '@/constants/routes';

/**
 * Returns the href for the "Create form" action.
 *
 * - If the workspace is on a paid plan → returns the normal NEW_FORM route
 * - If the workspace is FREE and at the form limit → returns /upgrade
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
    return `${ROUTES.UPGRADE}?workspace=${workspaceId}&reason=forms`;
  }
  return ROUTES.workspace(workspaceId).NEW_FORM;
}

/**
 * Returns the href for the "Create workspace" action.
 *
 * - If the user owns at least one FREE workspace → returns /upgrade (free users
 *   can only own one workspace; they must upgrade an existing one to create more)
 * - Otherwise → returns the normal NEW_WORKSPACE route
 */
export function useCreateWorkspaceHref(): string {
  const { hasFreeOwnedWorkspace } = usePlan();

  if (hasFreeOwnedWorkspace) {
    return `${ROUTES.UPGRADE}?reason=workspaces`;
  }
  return ROUTES.NEW_WORKSPACE;
}
