'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { FileText } from 'lucide-react';

export default function WorkspaceFormsPage() {
  const { workspace } = useWorkspaceContext();

  return (
    <div className="space-y-6">
      <PageHeader title="Forms" description={`Forms in ${workspace.name}`} />
      <EmptyState
        icon={FileText}
        title="No forms yet"
        description="Form management will be implemented in a future phase."
      />
    </div>
  );
}
