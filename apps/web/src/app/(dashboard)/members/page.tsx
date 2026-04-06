'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/loading-state';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { ROUTES } from '@/constants/routes';

export default function MembersPage() {
  const router = useRouter();
  const { data: workspaces } = useWorkspaces();

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      router.replace(ROUTES.workspace(workspaces[0].id).MEMBERS);
    }
  }, [workspaces, router]);

  return (
    <div className="flex justify-center py-24">
      <LoadingState message="Loading..." />
    </div>
  );
}
