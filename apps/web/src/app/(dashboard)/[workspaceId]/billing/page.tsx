'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { CreditCard } from 'lucide-react';

export default function WorkspaceBillingPage() {
  const { workspace } = useWorkspaceContext();

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description={`Billing for ${workspace.name}`} />
      <EmptyState
        icon={CreditCard}
        title="Billing coming soon"
        description="Plan management and billing will be available in a future update."
      />
    </div>
  );
}
