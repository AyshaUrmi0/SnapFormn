'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/providers/modal-provider';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForms, useDeleteForm, useUpdateForm, useDuplicateForm } from '@/modules/form/form.queries';
import { FormActionsMenu } from '@/features/forms/form-actions-menu';
import { RenameFormDialog } from '@/features/forms/rename-form-dialog';
import { ROUTES } from '@/constants/routes';
import { formatRelativeTime } from '@/lib/date-utils';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import type { Form } from '@/modules/form/types';

export default function WorkspaceHomePage() {
  const router = useRouter();
  const { confirm } = useModal();
  const { workspace, currentUserPermissions } = useWorkspaceContext();
  const workspaceId = workspace.id;
  const { data: forms, isLoading, isError, error, refetch } = useForms({ workspaceId });

  const deleteForm = useDeleteForm();
  const updateForm = useUpdateForm();
  const duplicateForm = useDuplicateForm();

  const [formToRename, setFormToRename] = useState<Form | null>(null);

  async function handleDelete(form: Form) {
    const confirmed = await confirm({
      title: 'Delete form',
      description: `Are you sure you want to delete "${form.title}"? All submissions will be permanently lost.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteForm.mutate({ workspaceId, formId: form.id });
    }
  }

  function handleRename(newTitle: string) {
    if (!formToRename) return;
    updateForm.mutate(
      { workspaceId, formId: formToRename.id, data: { title: newTitle } },
      { onSuccess: () => setFormToRename(null) },
    );
  }

  function handleDuplicate(form: Form) {
    duplicateForm.mutate({ workspaceId, formId: form.id });
  }

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
          {forms.map((form) => {
            const submissions = form._count?.submissions ?? 0;
            return (
              <Link
                key={form.id}
                href={ROUTES.workspace(workspaceId).form(form.id).EDIT}
                className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{form.title}</span>
                    {form.status === 'DRAFT' && (
                      <Badge variant="secondary" className="text-[11px] px-1.5 py-0.5 shrink-0">
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
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <FormActionsMenu
                    form={form}
                    workspaceId={workspaceId}
                    userPermissions={currentUserPermissions}
                    onEdit={() => router.push(ROUTES.workspace(workspaceId).form(form.id).EDIT)}
                    onRename={() => setFormToRename(form)}
                    onDuplicate={() => handleDuplicate(form)}
                    onDelete={() => handleDelete(form)}
                    onAnalytics={() => router.push(ROUTES.workspace(workspaceId).form(form.id).ANALYTICS)}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <RenameFormDialog
        open={!!formToRename}
        onOpenChange={(open) => !open && setFormToRename(null)}
        currentTitle={formToRename?.title ?? ''}
        onRename={handleRename}
        loading={updateForm.isPending}
      />
    </div>
  );
}
