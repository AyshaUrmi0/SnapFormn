'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/shared/loading-state';
import { usePlan } from '@/providers/plan-provider';
import { ROUTES } from '@/constants/routes';

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
