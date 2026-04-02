import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workspaces',
};

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Workspaces" description="Manage your workspaces" />
      <EmptyState
        icon={Briefcase}
        title="No workspaces yet"
        description="Workspace management will be implemented in Phase 03."
      />
    </div>
  );
}
