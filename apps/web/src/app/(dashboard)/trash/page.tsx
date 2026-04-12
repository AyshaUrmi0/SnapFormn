'use client';

import { useState } from 'react';
import { Trash2, Undo2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import {
  useTrash,
  useRestoreForm,
  usePermanentDeleteForm,
  useEmptyTrash,
} from '@/modules/form/form.queries';
import { formatRelativeTime } from '@/lib/date-utils';
import type { Form } from '@/modules/form/types';

export default function TrashPage() {
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id ?? '';

  const { data: trashedForms, isLoading } = useTrash(workspaceId);
  const restoreMutation = useRestoreForm();
  const permanentDeleteMutation = usePermanentDeleteForm();
  const emptyTrashMutation = useEmptyTrash();

  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  if (workspacesLoading || isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingState message="Loading trash..." />
      </div>
    );
  }

  const forms = trashedForms ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          {forms.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {forms.length} {forms.length === 1 ? 'item' : 'items'} in trash
            </p>
          )}
        </div>
      </div>

      {forms.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Items you delete will appear here. You can restore them or permanently delete them."
        />
      ) : (
        <>
          <div className="divide-y rounded-lg border">
            {forms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{form.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Form{' · '}Deleted {formatRelativeTime(form.deletedAt!)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Restore"
                    onClick={() =>
                      restoreMutation.mutate({
                        workspaceId,
                        formId: form.id,
                      })
                    }
                    disabled={restoreMutation.isPending}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete permanently"
                    onClick={() => setFormToDelete(form)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Permanently deletes all items in trash. This cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => setConfirmEmptyTrash(true)}
              disabled={emptyTrashMutation.isPending}
            >
              Empty trash
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmEmptyTrash}
        onOpenChange={setConfirmEmptyTrash}
        title="Empty trash?"
        description="This will permanently delete all items in trash. This action cannot be undone."
        confirmLabel="Empty trash"
        variant="destructive"
        loading={emptyTrashMutation.isPending}
        onConfirm={() => {
          emptyTrashMutation.mutate(
            { workspaceId },
            { onSuccess: () => setConfirmEmptyTrash(false) },
          );
        }}
      />

      <ConfirmDialog
        open={!!formToDelete}
        onOpenChange={(open) => !open && setFormToDelete(null)}
        title="Delete permanently?"
        description={`"${formToDelete?.title}" will be permanently deleted along with all its submissions. This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="destructive"
        loading={permanentDeleteMutation.isPending}
        onConfirm={() => {
          if (!formToDelete) return;
          permanentDeleteMutation.mutate(
            { workspaceId, formId: formToDelete.id },
            { onSuccess: () => setFormToDelete(null) },
          );
        }}
      />
    </div>
  );
}
