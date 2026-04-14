'use client';

import Link from 'next/link';
import { ArrowUpRight, FileText, Inbox, Users, Sparkles, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkspaceUsage } from '@/modules/workspace/workspace.queries';
import { ROUTES } from '@/constants/routes';
import type { LucideIcon } from 'lucide-react';
import type { WorkspaceWithRole } from '@/modules/workspace/types';

const PLAN_BADGE_CLASS: Record<string, string> = {
  FREE: 'bg-muted text-foreground border-0',
  PRO: 'bg-primary text-primary-foreground border-0',
  BUSINESS: 'bg-violet-600 text-white border-0',
};

interface WorkspaceCardProps {
  workspace: WorkspaceWithRole;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const { data: usage } = useWorkspaceUsage(workspace.id);
  const isFree = workspace.plan === 'FREE';
  const wsRoutes = ROUTES.workspace(workspace.id);

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base truncate">{workspace.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {workspace.role.toLowerCase()} · /{workspace.slug}
          </p>
        </div>
        <Badge className={cn('text-[10px] shrink-0', PLAN_BADGE_CLASS[workspace.plan])}>
          {workspace.plan}
        </Badge>
      </div>

      {/* Usage metrics */}
      <div className="grid grid-cols-3 gap-2">
        <UsageStat
          icon={FileText}
          label="Forms"
          current={usage?.forms.current}
          limit={usage?.forms.limit}
          showProgress={isFree}
        />
        <UsageStat
          icon={Inbox}
          label="Submissions"
          current={usage?.submissionsThisMonth.current}
          limit={usage?.submissionsThisMonth.limit}
          showProgress={isFree}
        />
        <UsageStat
          icon={Users}
          label="Members"
          current={usage?.members.current}
          limit={usage?.members.limit}
          showProgress={isFree}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={wsRoutes.ROOT}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1')}
        >
          Open
          <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
        </Link>
        {isFree ? (
          <Link
            href={wsRoutes.UPGRADE}
            className={cn(buttonVariants({ size: 'sm' }), 'flex-1')}
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Upgrade
          </Link>
        ) : (
          <Link
            href={wsRoutes.BILLING}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1')}
          >
            <CreditCard className="mr-1 h-3.5 w-3.5" />
            Billing
          </Link>
        )}
      </div>
    </div>
  );
}

interface UsageStatProps {
  icon: LucideIcon;
  label: string;
  current: number | undefined;
  limit: number | null | undefined;
  showProgress: boolean;
}

function UsageStat({ icon: Icon, label, current, limit, showProgress }: UsageStatProps) {
  const isLoading = current === undefined;
  const isUnlimited = limit === null;
  const value = isLoading ? '—' : current;
  const limitText = isLoading ? '' : isUnlimited ? '∞' : `/ ${limit}`;

  // Progress bar percent (only shown for FREE plan with numeric limit)
  let percent = 0;
  let isCritical = false;
  if (showProgress && !isLoading && !isUnlimited && typeof limit === 'number' && limit > 0) {
    percent = Math.min(100, Math.round(((current ?? 0) / limit) * 100));
    isCritical = percent >= 90;
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 space-y-1">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-lg font-semibold leading-none', isCritical && 'text-amber-600 dark:text-amber-400')}>
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground">{limitText}</span>
      </div>
      {showProgress && !isLoading && !isUnlimited && (
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              isCritical ? 'bg-amber-500' : 'bg-primary',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
