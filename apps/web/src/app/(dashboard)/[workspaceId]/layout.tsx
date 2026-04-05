'use client';

import { use } from 'react';
import { WorkspaceProvider } from '@/providers/workspace-provider';

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return <WorkspaceProvider workspaceId={workspaceId}>{children}</WorkspaceProvider>;
}
