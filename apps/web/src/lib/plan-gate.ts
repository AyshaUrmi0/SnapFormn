import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { isPlanLimitError } from './errors';

export type PlanLimitReason =
  | 'forms'
  | 'workspaces'
  | 'members'
  | 'submissions'
  | 'domains'
  | 'branding';

/**
 * If `error` is a plan-limit error, redirect the user to the upgrade page
 * with the given reason and workspace. Returns `true` if redirected.
 */
export function redirectOnPlanLimit(
  error: unknown,
  router: AppRouterInstance,
  workspaceId: string | null,
  reason: PlanLimitReason,
): boolean {
  if (!isPlanLimitError(error)) return false;

  const params = new URLSearchParams();
  if (workspaceId) params.set('workspace', workspaceId);
  params.set('reason', reason);
  router.push(`/upgrade?${params.toString()}`);
  return true;
}
