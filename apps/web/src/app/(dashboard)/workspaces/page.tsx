'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { WorkspaceCard } from '@/features/workspaces/workspace-card';
import { useAuth } from '@/hooks/use-auth';
import { useCreateWorkspaceHref } from '@/hooks/use-creation-hrefs';
import { Briefcase, Plus } from 'lucide-react';

export default function WorkspacesPage() {
  const { user } = useAuth();
  const { data: workspaces, isLoading, isError, error, refetch } = useWorkspaces();
  const newWorkspaceHref = useCreateWorkspaceHref();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description={user ? `Welcome, ${user.name || user.email}` : 'Manage your workspaces'}
        action={
          <Link href={newWorkspaceHref}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create workspace
            </Button>
          </Link>
        }
      />

      {isLoading && <LoadingState message="Loading workspaces..." />}

      {isError && (
        <ErrorState
          message={error?.message ?? 'Failed to load workspaces'}
          onRetry={() => refetch()}
        />
      )}

      {workspaces && workspaces.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No workspaces yet"
          description="Create your first workspace to start building forms."
          action={
            <Link href={newWorkspaceHref}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create workspace
              </Button>
            </Link>
          }
        />
      )}

      {workspaces && workspaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}
    </div>
  );
}
