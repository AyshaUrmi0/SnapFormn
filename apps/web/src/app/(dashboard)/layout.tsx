'use client';

import { AuthGuard } from '@/components/shared/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        {/* Topbar and Sidebar will be added in Phase 04 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
