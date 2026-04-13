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

/**
 * If `error` is a plan-limit error, redirect the user to the upgrade page
 * with the given reason. Returns `true` if redirected.
 *
 * If a workspaceId is provided, redirects to that workspace's upgrade page.
 * Otherwise (e.g. workspace creation failed), falls back to the legacy global
 * /upgrade route which then redirects to the user's first workspace.
 */
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
