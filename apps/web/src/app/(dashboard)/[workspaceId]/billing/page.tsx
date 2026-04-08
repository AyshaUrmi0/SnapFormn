'use client';

import Link from 'next/link';
import { CreditCard, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { LoadingState } from '@/components/shared/loading-state';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useSubscription, useGetPortal } from '@/modules/billing/billing.queries';
import { PLANS } from '@/constants/plans';
import { ROUTES } from '@/constants/routes';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PAST_DUE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  TRIALING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  INCOMPLETE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function WorkspaceBillingPage() {
  const { workspace } = useWorkspaceContext();
  const { data: subscription, isLoading } = useSubscription(workspace.id);
  const portal = useGetPortal();

  const planKey = workspace.plan;
  const planInfo = PLANS[planKey];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingState message="Loading billing..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Billing" description={`Billing for ${workspace.name}`} />

      {/* Current plan card */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{planInfo.name} Plan</h2>
              {subscription && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[subscription.status] ?? ''}`}>
                  {subscription.status.replace('_', ' ')}
                </span>
              )}
              {!subscription && planKey === 'FREE' && (
                <span className="text-sm text-muted-foreground">Free forever</span>
              )}
            </div>
          </div>
        </div>

        {/* Subscription details */}
        {subscription && (
          <div className="space-y-2 text-sm">
            {subscription.currentPeriodEnd && (
              <p className="text-muted-foreground">
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Your subscription will cancel at the end of the current billing period.</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {subscription && subscription.status !== 'CANCELED' && (
            <Button
              variant="outline"
              onClick={() => portal.mutate({ workspaceId: workspace.id })}
              disabled={portal.isPending}
            >
              {portal.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Manage subscription
            </Button>
          )}
          <Link
            href={`${ROUTES.UPGRADE}?workspace=${workspace.id}`}
            className={buttonVariants({ variant: subscription ? 'ghost' : 'default' })}
          >
            {planKey === 'FREE' ? 'Upgrade' : 'Change plan'}
          </Link>
        </div>
      </div>

      {/* Free plan upgrade prompt */}
      {planKey === 'FREE' && (
        <div className="rounded-xl border border-dashed p-6 text-center space-y-3">
          <h3 className="font-semibold">Unlock more features</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro or Business to remove branding, get unlimited forms, advanced analytics, and more.
          </p>
          <Link
            href={`${ROUTES.UPGRADE}?workspace=${workspace.id}`}
            className={buttonVariants()}
          >
            View pricing
          </Link>
        </div>
      )}
    </div>
  );
}
