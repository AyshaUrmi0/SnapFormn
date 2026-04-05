'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function WorkspaceRootPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.workspace(workspaceId).FORMS);
  }, [workspaceId, router]);

  return null;
}
