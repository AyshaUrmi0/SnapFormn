'use client';

import { useWorkspaces, useWorkspaceUsage } from '@/modules/workspace/workspace.queries';
import { ROUTES } from '@/constants/routes';

/**
 * Returns an href for the "Create form" action.
 * If the workspace is at its form limit, returns the upgrade page URL instead.
 */
export function useCreateFormHref(workspaceId: string): string {
  const { data: usage } = useWorkspaceUsage(workspaceId);

  if (!usage) return ROUTES.workspace(workspaceId).NEW_FORM;
  if (usage.forms.limit !== null && usage.forms.current >= usage.forms.limit) {
    return `${ROUTES.UPGRADE}?workspace=${workspaceId}&reason=forms`;
  }
  return ROUTES.workspace(workspaceId).NEW_FORM;
}

/**
 * Returns an href for the "Create workspace" action.
 * If the user already owns a FREE workspace, returns the upgrade page URL instead.
 */
export function useCreateWorkspaceHref(): string {
  const { data: workspaces } = useWorkspaces();

  if (!workspaces) return ROUTES.NEW_WORKSPACE;
  const freeOwned = workspaces.filter((w) => w.plan === 'FREE' && w.role === 'OWNER').length;
  if (freeOwned >= 1) {
    return `${ROUTES.UPGRADE}?reason=workspaces`;
  }
  return ROUTES.NEW_WORKSPACE;
}
