'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForms } from '@/modules/form/form.queries';
import { ROUTES } from '@/constants/routes';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import type { Form } from '@/modules/form/types';

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 60) return `${Math.max(1, diffMin)}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function FormRow({ form, workspaceId }: { form: Form; workspaceId: string }) {
  const submissions = form._count?.submissions ?? 0;

  return (
    <Link
      href={ROUTES.workspace(workspaceId).form(form.id).EDIT}
      className="flex items-start gap-3 py-3 px-2 rounded-md hover:bg-muted/50 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{form.title}</span>
          {form.status === 'DRAFT' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
              Draft
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {submissions === 0
            ? 'No completed submissions yet'
            : `${submissions} submission${submissions !== 1 ? 's' : ''}`}
          {' · '}Edited {formatRelativeTime(form.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

export default function WorkspaceHomePage() {
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace.id;
  const { data: forms, isLoading, isError, error, refetch } = useForms({ workspaceId });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Home</h1>
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.NEW_WORKSPACE}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            New workspace
          </Link>
          <Link
            href={ROUTES.workspace(workspaceId).NEW_FORM}
            className={buttonVariants({ size: 'sm' })}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New form
          </Link>
        </div>
      </div>

      {/* Form list */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingState message="Loading forms..." />
        </div>
      )}

      {isError && (
        <div className="flex justify-center py-12">
          <ErrorState message={error?.message ?? 'Failed to load forms'} onRetry={() => refetch()} />
        </div>
      )}

      {!isLoading && !isError && forms && forms.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">No forms yet</p>
          <Link
            href={ROUTES.workspace(workspaceId).NEW_FORM}
            className={buttonVariants()}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create your first form
          </Link>
        </div>
      )}

      {!isLoading && !isError && forms && forms.length > 0 && (
        <div>
          {forms.map((form) => (
            <FormRow key={form.id} form={form} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </div>
  );
}
