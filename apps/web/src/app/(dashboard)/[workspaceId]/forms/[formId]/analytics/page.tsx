'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/loading-state';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useForm as useFormQuery } from '@/modules/form/form.queries';
import { useFormAnalytics } from '@/modules/submission/submission.queries';
import { useSubmissions } from '@/modules/submission/submission.queries';
import { OverviewCards } from '@/features/analytics/overview-cards';
import { SubmissionTimelineChart } from '@/features/analytics/submission-timeline-chart';
import { FieldResponseChart } from '@/features/analytics/field-response-chart';
import { ResponsesTable } from '@/features/analytics/responses-table';
import { ROUTES } from '@/constants/routes';
import type { FormAnalytics } from '@/modules/submission/types';

/**
 * Compute analytics client-side from raw submissions + form fields
 * as a fallback when the backend analytics endpoint is unavailable.
 */
function computeClientAnalytics(
  submissions: Array<{ id: string; completedAt: string | null; createdAt: string; fields?: Array<{ fieldId: string }> }>,
  formFields: Array<{ id: string; label: string; type: string }>,
): FormAnalytics {
  const total = submissions.length;
  const completed = submissions.filter((s) => s.completedAt).length;

  const sorted = [...submissions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Timeline: group by date
  const timelineMap = new Map<string, number>();
  for (const s of sorted) {
    const date = new Date(s.createdAt).toISOString().split('T')[0];
    timelineMap.set(date, (timelineMap.get(date) ?? 0) + 1);
  }
  const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));

  // Field stats
  const fieldCountMap = new Map<string, number>();
  for (const s of submissions) {
    for (const f of s.fields ?? []) {
      fieldCountMap.set(f.fieldId, (fieldCountMap.get(f.fieldId) ?? 0) + 1);
    }
  }

  const fieldStats = formFields
    .filter((f) => f.type !== 'STATEMENT' && f.type !== 'PAGE_BREAK')
    .map((f) => {
      const responseCount = fieldCountMap.get(f.id) ?? 0;
      return {
        fieldId: f.id,
        label: f.label,
        type: f.type,
        responseCount,
        responseRate: total > 0 ? Math.round((responseCount / total) * 100) : 0,
      };
    });

  return {
    overview: {
      totalSubmissions: total,
      completedSubmissions: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      firstSubmissionAt: sorted[0]?.createdAt ?? null,
      lastSubmissionAt: sorted[sorted.length - 1]?.createdAt ?? null,
    },
    timeline,
    fieldStats,
  };
}

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; formId: string }>;
}) {
  const { workspaceId, formId } = use(params);
  const { workspace } = useWorkspaceContext();

  const { data: form, isLoading: formLoading } = useFormQuery(workspaceId, formId);
  const { data: serverAnalytics, isLoading: analyticsLoading, isError: analyticsError } = useFormAnalytics(workspaceId, formId);

  // Fallback: fetch submissions if server analytics fails
  const { data: submissions, isLoading: subsLoading } = useSubmissions({
    workspaceId,
    formId,
  });

  const analytics = useMemo<FormAnalytics | null>(() => {
    // Prefer server analytics
    if (serverAnalytics) return serverAnalytics;

    // Fallback: compute from raw data
    if (analyticsError && submissions && form?.fields) {
      return computeClientAnalytics(
        submissions as Array<{ id: string; completedAt: string | null; createdAt: string; fields?: Array<{ fieldId: string }> }>,
        (form.fields ?? []).map((f) => ({ id: f.id, label: f.label, type: f.type })),
      );
    }

    return null;
  }, [serverAnalytics, analyticsError, submissions, form]);

  const isLoading = formLoading || (analyticsLoading && subsLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState message="Loading analytics..." />
      </div>
    );
  }

  // Use empty analytics if nothing available
  const data: FormAnalytics = analytics ?? {
    overview: { totalSubmissions: 0, completedSubmissions: 0, completionRate: 0, firstSubmissionAt: null, lastSubmissionAt: null },
    timeline: [],
    fieldStats: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.workspace(workspaceId).form(formId).SUBMISSIONS}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">
            {form?.title ?? 'Form'} — Analytics
          </h1>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>
        <Link href={ROUTES.workspace(workspaceId).form(formId).SUBMISSIONS}>
          <Button variant="outline" size="sm">
            View submissions
          </Button>
        </Link>
      </div>

      {/* Overview cards */}
      <OverviewCards overview={data.overview} />

      {/* Charts */}
      {data.overview.totalSubmissions === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No submissions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Share your form to start collecting responses and see analytics.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <SubmissionTimelineChart data={data.timeline} />
            <FieldResponseChart data={data.fieldStats} />
          </div>

          <ResponsesTable
            formTitle={form?.title ?? 'form'}
            fields={form?.fields ?? []}
            submissions={submissions ?? []}
          />
        </>
      )}
    </div>
  );
}
