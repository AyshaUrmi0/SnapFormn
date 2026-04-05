'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-logout';
import { useAuth } from '@/hooks/use-auth';
import { Briefcase, LogOut } from 'lucide-react';

export default function WorkspacesPage() {
  const logout = useLogout();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description={user ? `Welcome, ${user.name || user.email}` : 'Manage your workspaces'}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logout.isPending ? 'Signing out...' : 'Sign out'}
          </Button>
        }
      />
      <EmptyState
        icon={Briefcase}
        title="No workspaces yet"
        description="Workspace management will be implemented in Phase 03."
      />
    </div>
  );
}
