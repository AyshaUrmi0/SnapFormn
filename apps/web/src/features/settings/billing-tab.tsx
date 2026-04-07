'use client';

import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BillingTab() {
  return (
    <div className="space-y-4 py-6">
      <div>
        <h2 className="text-lg font-medium">Billing</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground/40" />
          <div>
            <p className="font-medium">Coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              Billing and subscription management will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
