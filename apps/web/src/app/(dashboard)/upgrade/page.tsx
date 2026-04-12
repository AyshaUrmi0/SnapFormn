'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { useCreateCheckout } from '@/modules/billing/billing.queries';
import { queryKeys } from '@/constants/query-keys';
import { PLANS } from '@/constants/plans';
import { ROUTES } from '@/constants/routes';
import type { Plan } from '@/modules/workspace/types';

const REASON_LABELS: Record<string, string> = {
  forms: 'create more forms',
  workspaces: 'create more workspaces',
  members: 'invite more members',
  submissions: 'receive more submissions',
  domains: 'use custom domains',
  branding: 'remove Snapform branding',
};

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const workspaceIdParam = searchParams.get('workspace');
  const reason = searchParams.get('reason');

  const { data: workspaces } = useWorkspaces();
  const checkout = useCreateCheckout();

  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Refetch workspaces on mount so the current plan reflects the latest
  // DB state (e.g. after returning from Stripe checkout)
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
  }, [queryClient]);

  const workspaceId = workspaceIdParam || workspaces?.[0]?.id || '';
  const currentPlan: Plan = workspaces?.find((w) => w.id === workspaceId)?.plan ?? 'FREE';

  function handleUpgrade(plan: 'PRO' | 'BUSINESS') {
    if (!workspaceId) {
      toast.error('No workspace found. Please create a workspace first.');
      return;
    }
    checkout.mutate({ workspaceId, plan, period });
  }

  const pro = PLANS.PRO;
  const business = PLANS.BUSINESS;
  const proPrice = period === 'monthly' ? pro.monthlyPrice : pro.yearlyPrice;
  const businessPrice = period === 'monthly' ? business.monthlyPrice : business.yearlyPrice;
  const priceSuffix = period === 'monthly' ? 'Every Month' : 'Every Year';

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      {/* Reason banner */}
      {reason && REASON_LABELS[reason] && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Upgrade to Pro to {REASON_LABELS[reason]}.
        </div>
      )}

      {/* Header with illustration */}
      <div className="flex items-start justify-between gap-6 mb-10">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Do more with Snapform</h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg max-w-xl">
            Upgrade to access advanced features designed for growing teams and creators.
          </p>
        </div>
        <div className="hidden md:flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 via-primary/20 to-purple-500/20 text-5xl">
          ✨
        </div>
      </div>

      {/* Period toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="inline-flex rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              period === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            Pay monthly
          </button>
          <button
            type="button"
            onClick={() => setPeriod('yearly')}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              period === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground',
            )}
          >
            Pay yearly
          </button>
        </div>
        {period === 'yearly' && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
            2 months off
          </Badge>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pro */}
        <PlanCard
          plan={pro}
          planKey="PRO"
          price={proPrice}
          priceSuffix={priceSuffix}
          ctaLabel="Upgrade to Pro"
          ctaVariant="primary"
          isCurrent={currentPlan === 'PRO'}
          isLoading={checkout.isPending && checkout.variables?.plan === 'PRO'}
          onUpgrade={() => handleUpgrade('PRO')}
        />
        {/* Business */}
        <PlanCard
          plan={business}
          planKey="BUSINESS"
          price={businessPrice}
          priceSuffix={priceSuffix}
          ctaLabel="Upgrade to Business"
          ctaVariant="outline"
          isCurrent={currentPlan === 'BUSINESS'}
          isLoading={checkout.isPending && checkout.variables?.plan === 'BUSINESS'}
          onUpgrade={() => handleUpgrade('BUSINESS')}
        />
      </div>

      {/* Fair use footer */}
      <p className="text-xs text-muted-foreground text-center mt-8">
        Snapform&apos;s plans are subject to our{' '}
        <a href="#" className="underline hover:text-foreground">
          Fair Use Policy
        </a>
        .
      </p>

      {/* Current plan indicator + billing link */}
      <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
        <p>
          You are currently on the <strong>{PLANS[currentPlan].name}</strong> plan.
        </p>
        {workspaceId && (
          <Link
            href={ROUTES.workspace(workspaceId).BILLING}
            className="text-primary hover:underline inline-block"
          >
            View billing details →
          </Link>
        )}
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: (typeof PLANS)['PRO' | 'BUSINESS'];
  planKey: 'PRO' | 'BUSINESS';
  price: number;
  priceSuffix: string;
  ctaLabel: string;
  ctaVariant: 'primary' | 'outline';
  isCurrent: boolean;
  isLoading: boolean;
  onUpgrade: () => void;
}

function PlanCard({ plan, planKey, price, priceSuffix, ctaLabel, ctaVariant, isCurrent, isLoading, onUpgrade }: PlanCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 flex flex-col transition-all',
        isCurrent ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/40',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">{plan.name}</h2>
      </div>

      <div className="mt-2 mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground text-sm">/{priceSuffix.includes('Month') ? 'mo' : 'yr'}</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={onUpgrade}
        disabled={isCurrent || isLoading}
        className={cn(
          'w-full',
          ctaVariant === 'primary' && 'bg-pink-600 hover:bg-pink-700 text-white',
        )}
        variant={ctaVariant === 'outline' ? 'outline' : undefined}
      >
        {isLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        {isCurrent ? 'Current plan' : ctaLabel}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-1.5">
        Pay ${price} {priceSuffix}
      </p>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-6">
        {plan.features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={`${planKey}-${feature.title}`} className="space-y-1">
              <Icon className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold leading-tight">{feature.title}</p>
              <p className="text-xs text-muted-foreground leading-tight">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
