'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { Button } from '@/components/ui/button';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForms, useDeleteForm, useUpdateFormStatus } from '@/modules/form/form.queries';
import { FormCard } from '@/features/forms/form-card';
import { PERMISSIONS } from '@/lib/permissions';
import { ROUTES } from '@/constants/routes';
import type { Form, FormStatus } from '@/modules/form/types';

const STATUS_FILTERS: { label: string; value: FormStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Closed', value: 'CLOSED' },
];

export default function WorkspaceFormsPage() {
  const { workspace, currentUserPermissions } = useWorkspaceContext();
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'ALL'>('ALL');
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  const { data, isLoading, isError, error, refetch } = useForms({
    workspaceId: workspace.id,
    params: { status: statusFilter === 'ALL' ? undefined : statusFilter },
  });

  const deleteForm = useDeleteForm();
  const updateFormStatus = useUpdateFormStatus();

  const forms = data ?? [];

  function handleStatusChange(form: Form, status: FormStatus) {
    updateFormStatus.mutate({ workspaceId: workspace.id, formId: form.id, data: { status } });
  }

  function handleDelete() {
    if (!formToDelete) return;
    deleteForm.mutate(
      { workspaceId: workspace.id, formId: formToDelete.id },
      { onSuccess: () => setFormToDelete(null) },
    );
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form: Form) => (
            <FormCard
              key={form.id}
              form={form}
              workspaceId={workspace.id}
              onDelete={setFormToDelete}
              onStatusChange={handleStatusChange}
              userPermissions={currentUserPermissions}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!formToDelete}
        onOpenChange={(open) => !open && setFormToDelete(null)}
        title="Delete form"
        description={`Are you sure you want to delete "${formToDelete?.title}"? All submissions will be permanently lost.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteForm.isPending}
        variant="destructive"
      />
    </div>
  );
}
