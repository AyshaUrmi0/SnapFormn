import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { isPlanLimitError } from './errors';
import { ROUTES } from '@/constants/routes';

export type PlanLimitReason =
  | 'forms'
  | 'workspaces'
  | 'members'
  | 'submissions'
  | 'domains'
  | 'branding';

export function redirectOnPlanLimit(
  error: unknown,
  router: AppRouterInstance,
  workspaceId: string | null,
  reason: PlanLimitReason,
): boolean {
  if (!isPlanLimitError(error)) return false;

  const search = `?reason=${reason}`;
  if (workspaceId) {
    router.push(`${ROUTES.workspace(workspaceId).UPGRADE}${search}`);
  } else {
    router.push(`/upgrade${search}`);
  }
  return true;
}
