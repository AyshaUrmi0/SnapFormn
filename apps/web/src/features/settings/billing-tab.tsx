'use client';

import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useSubscription } from '@/modules/billing/billing.queries';
import { PLANS } from '@/constants/plans';
import { ROUTES } from '@/constants/routes';

export function BillingTab() {
  const { workspace } = useWorkspaceContext();
  const { data: subscription } = useSubscription(workspace.id);

  const planInfo = PLANS[workspace.plan];

  return (
    <div className="space-y-4 py-6">
      <div>
        <h2 className="text-lg font-medium">Billing</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing.</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{planInfo.name} Plan</p>
              {subscription && (
                <Badge variant="secondary" className="text-[10px] mt-0.5">
                  {subscription.status.replace('_', ' ')}
                </Badge>
              )}
              {!subscription && workspace.plan === 'FREE' && (
                <p className="text-xs text-muted-foreground">Free forever</p>
              )}
            </div>
          </div>
          <Link
            href={ROUTES.workspace(workspace.id).BILLING}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Manage billing
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
