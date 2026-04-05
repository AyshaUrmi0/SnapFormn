import { WorkspaceProvider } from '@/providers/workspace-provider';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return <WorkspaceProvider workspaceId={workspaceId}>{children}</WorkspaceProvider>;
}
