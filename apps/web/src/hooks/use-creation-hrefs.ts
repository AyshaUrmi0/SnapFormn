'use client';

import { useWorkspaceUsage } from '@/modules/workspace/workspace.queries';
import { usePlan } from '@/providers/plan-provider';
import { ROUTES } from '@/constants/routes';

export function useCreateFormHref(workspaceId: string): string {
  const { isPaid } = usePlan();
  const { data: usage } = useWorkspaceUsage(workspaceId);

  if (workspaceId && isPaid(workspaceId)) {
    return ROUTES.workspace(workspaceId).NEW_FORM;
  }

  if (!usage) return ROUTES.workspace(workspaceId).NEW_FORM;
  if (usage.forms.limit !== null && usage.forms.current >= usage.forms.limit) {
    return `${ROUTES.workspace(workspaceId).UPGRADE}?reason=forms`;
  }
  return ROUTES.workspace(workspaceId).NEW_FORM;
}

export function useCreateWorkspaceHref(): string {
  const { canCreateWorkspace, workspaces } = usePlan();

  if (canCreateWorkspace) return ROUTES.NEW_WORKSPACE;

  const firstOwned = workspaces?.find((w) => w.role === 'OWNER');
  if (firstOwned) {
    return `${ROUTES.workspace(firstOwned.id).UPGRADE}?reason=workspaces`;
  }
  return ROUTES.NEW_WORKSPACE;
}
