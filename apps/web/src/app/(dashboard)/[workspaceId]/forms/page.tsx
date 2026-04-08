'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { PermissionGate } from '@/components/shared/permission-gate';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForms, useDeleteForm, useUpdateForm, useDuplicateForm } from '@/modules/form/form.queries';
import { FormActionsMenu } from '@/features/forms/form-actions-menu';
import { RenameFormDialog } from '@/features/forms/rename-form-dialog';
import { FormStatusBadge } from '@/features/forms/form-status-badge';
import { PERMISSIONS } from '@/lib/permissions';
import { ROUTES } from '@/constants/routes';
import { formatRelativeTime } from '@/lib/date-utils';
import type { Form, FormStatus } from '@/modules/form/types';

const STATUS_FILTERS: { label: string; value: FormStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Closed', value: 'CLOSED' },
];

export default function WorkspaceFormsPage() {
  const router = useRouter();
  const { confirm } = useModal();
  const { workspace, currentUserPermissions } = useWorkspaceContext();
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'ALL'>('ALL');
  const [formToRename, setFormToRename] = useState<Form | null>(null);

  const { data, isLoading, isError, error, refetch } = useForms({
    workspaceId: workspace.id,
    params: { status: statusFilter === 'ALL' ? undefined : statusFilter },
  });

  const deleteForm = useDeleteForm();
  const updateForm = useUpdateForm();
  const duplicateForm = useDuplicateForm();

  const forms = data ?? [];

  async function handleDelete(form: Form) {
    const confirmed = await confirm({
      title: 'Move to trash?',
      description: `"${form.title}" will be moved to trash. You can restore it later.`,
      confirmLabel: 'Move to trash',
    });
    if (confirmed) {
      deleteForm.mutate({ workspaceId: workspace.id, formId: form.id });
    }
  }

  function handleRename(newTitle: string) {
    if (!formToRename) return;
    updateForm.mutate(
      { workspaceId: workspace.id, formId: formToRename.id, data: { title: newTitle } },
      { onSuccess: () => setFormToRename(null) },
    );
  }

  function handleDuplicate(form: Form) {
    duplicateForm.mutate({ workspaceId: workspace.id, formId: form.id });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forms"
        description={`Forms in ${workspace.name}`}
        action={
          <PermissionGate permissions={[PERMISSIONS.FORM_CREATE]} userPermissions={currentUserPermissions}>
            <Link href={ROUTES.workspace(workspace.id).NEW_FORM}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create form
              </Button>
            </Link>
          </PermissionGate>
        }
      />

      <div className="flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading && <LoadingState message="Loading forms..." />}

      {isError && (
        <ErrorState
          message={error?.message ?? 'Failed to load forms'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && forms.length === 0 && (
        <EmptyState
          icon={FileText}
          title={statusFilter === 'ALL' ? 'No forms yet' : `No ${statusFilter.toLowerCase()} forms`}
          description={statusFilter === 'ALL' ? 'Create your first form to get started.' : undefined}
          action={
            statusFilter === 'ALL' ? (
              <PermissionGate permissions={[PERMISSIONS.FORM_CREATE]} userPermissions={currentUserPermissions}>
                <Link href={ROUTES.workspace(workspace.id).NEW_FORM}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create form
                  </Button>
                </Link>
              </PermissionGate>
            ) : undefined
          }
        />
      )}

      {forms.length > 0 && (
        <div className="rounded-lg border">
          {forms.map((form: Form, idx: number) => {
            const submissions = form._count?.submissions ?? 0;
            return (
              <Link
                key={form.id}
                href={ROUTES.workspace(workspace.id).form(form.id).EDIT}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors${idx < forms.length - 1 ? ' border-b' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{form.title}</span>
                    <FormStatusBadge status={form.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {submissions} submission{submissions !== 1 ? 's' : ''}
                    {' · '}Edited {formatRelativeTime(form.updatedAt)}
                  </p>
                </div>
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <FormActionsMenu
                    form={form}
                    workspaceId={workspace.id}
                    userPermissions={currentUserPermissions}
                    onEdit={() => router.push(ROUTES.workspace(workspace.id).form(form.id).EDIT)}
                    onRename={() => setFormToRename(form)}
                    onDuplicate={() => handleDuplicate(form)}
                    onDelete={() => handleDelete(form)}
                    onAnalytics={() => router.push(ROUTES.workspace(workspace.id).form(form.id).ANALYTICS)}
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
