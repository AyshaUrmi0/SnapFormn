'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { useCreateCheckout } from '@/modules/billing/billing.queries';
import { PLANS } from '@/constants/plans';
import { ROUTES } from '@/constants/routes';
import type { Plan } from '@/modules/workspace/types';

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const workspaceIdParam = searchParams.get('workspace');

  const { data: workspaces } = useWorkspaces();
  const checkout = useCreateCheckout();

  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const workspaceId = workspaceIdParam || workspaces?.[0]?.id || '';
  const currentPlan: Plan = workspaces?.find((w) => w.id === workspaceId)?.plan ?? 'FREE';

  function handleUpgrade(plan: 'PRO' | 'BUSINESS') {
    if (!workspaceId) {
      toast.error('No workspace found. Please create a workspace first.');
      return;
    }
    checkout.mutate({ workspaceId, plan, period });
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upgrade your plan</h1>
        <p className="text-muted-foreground">Choose the plan that works best for you and your team.</p>
      </div>

      {/* Period toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          type="button"
          onClick={() => setPeriod('monthly')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            period === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setPeriod('yearly')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            period === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Yearly
        </button>
        {period === 'yearly' && (
          <Badge variant="secondary" className="text-xs">Save 17%</Badge>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {(['PRO', 'BUSINESS'] as const).map((planKey) => {
          const plan = PLANS[planKey];
          const price = period === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const isCurrentPlan = currentPlan === planKey;

          return (
            <div
              key={planKey}
              className={cn(
                'rounded-xl border p-6 flex flex-col transition-all',
                isCurrentPlan
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{plan.name}</h2>
                {planKey === 'PRO' && (
                  <Badge className="text-[10px]">Popular</Badge>
                )}
              </div>

              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">${price}</span>
                <span className="text-muted-foreground text-sm">
                  /{period === 'monthly' ? 'mo' : 'yr'}
                </span>
                {period === 'yearly' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ${plan.monthlyPrice}/mo billed monthly
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(planKey)}
                disabled={isCurrentPlan || checkout.isPending}
                className="w-full"
              >
                {checkout.isPending && checkout.variables?.plan === planKey && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                {isCurrentPlan ? 'Current plan' : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Current plan info + billing link */}
      <div className="text-center text-sm text-muted-foreground mt-8 space-y-2">
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
