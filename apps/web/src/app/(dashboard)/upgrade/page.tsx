'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/shared/loading-state';
import { usePlan } from '@/providers/plan-provider';
import { ROUTES } from '@/constants/routes';

/**
 * Legacy global upgrade route. Redirects to the workspace-scoped upgrade page.
 * Picks the workspace from the `?workspace=` query param, the first FREE
 * workspace the user owns, or the first workspace overall.
 */
export default function LegacyUpgradeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceIdParam = searchParams.get('workspace');
  const reason = searchParams.get('reason');

  const { workspaces } = usePlan();

  useEffect(() => {
    if (!workspaces) return;

    const targetId =
      workspaceIdParam ||
      // Prefer a FREE workspace (most likely to be the upgrade target)
      workspaces.find((w) => w.plan === 'FREE' && w.role === 'OWNER')?.id ||
      workspaces[0]?.id;

    if (!targetId) {
      router.replace(ROUTES.WORKSPACES);
      return;
    }

    const search = reason ? `?reason=${reason}` : '';
    router.replace(`${ROUTES.workspace(targetId).UPGRADE}${search}`);
  }, [workspaces, workspaceIdParam, reason, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  );
}
