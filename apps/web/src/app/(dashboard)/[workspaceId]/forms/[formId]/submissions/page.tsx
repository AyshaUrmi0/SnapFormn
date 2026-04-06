'use client';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Trash2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForm as useFormQuery } from '@/modules/form/form.queries';
import { useSubmissions, useDeleteSubmission } from '@/modules/submission/submission.queries';
import { SubmissionDetailDialog } from '@/features/submissions/submission-detail-dialog';
import { ROUTES } from '@/constants/routes';
import type { Submission } from '@/modules/submission/types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPreviewText(submission: Submission): string {
  const firstField = submission.fields?.[0];
  if (!firstField) return 'No data';
  const val = firstField.value;
  if (typeof val === 'string') return val.slice(0, 80);
  if (Array.isArray(val)) return val.join(', ').slice(0, 80);
  return String(val).slice(0, 80);
}

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; formId: string }>;
}) {
  const { workspaceId, formId } = use(params);
  const { workspace } = useWorkspaceContext();

  const { data: form, isLoading: formLoading } = useFormQuery(workspaceId, formId);
  const { data: submissions, isLoading, isError, error, refetch } = useSubmissions({
    workspaceId,
    formId,
  });
  const deleteSubmission = useDeleteSubmission();

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);

  if (isLoading || formLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState message="Loading submissions..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ErrorState
          message={error?.message ?? 'Failed to load submissions'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const submissionList = submissions ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.workspace(workspaceId).FORMS}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">
            {form?.title ?? 'Form'} — Submissions
          </h1>
          <p className="text-sm text-muted-foreground">
            {submissionList.length} response{submissionList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href={ROUTES.workspace(workspaceId).form(formId).EDIT}>
          <Button variant="outline" size="sm">
            Edit form
          </Button>
        </Link>
      </div>

      {/* Submissions list */}
      {submissionList.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No submissions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Share your form to start collecting responses.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Response</span>
            <span>Submitted</span>
            <span className="w-20 text-right">Actions</span>
          </div>
          {submissionList.map((submission) => (
            <div
              key={submission.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm truncate">{getPreviewText(submission)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {submission.fields?.length ?? 0} field{(submission.fields?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(submission.createdAt)}
              </span>
              <div className="flex items-center gap-1 w-20 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(submission)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="View details"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(submission)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <SubmissionDetailDialog
        open={!!selectedSubmission}
        onOpenChange={(open) => { if (!open) setSelectedSubmission(null); }}
        submission={selectedSubmission}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete submission"
        description="Are you sure you want to delete this submission? This action cannot be undone."
        onConfirm={() => {
          if (deleteTarget) {
            deleteSubmission.mutate(
              { workspaceId, formId, submissionId: deleteTarget.id },
              { onSuccess: () => setDeleteTarget(null) },
            );
          }
        }}
        loading={deleteSubmission.isPending}
        variant="destructive"
      />
    </div>
  );
}
