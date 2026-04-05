'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/shared/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useIsMobile } from '@/hooks/use-media-query';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {!isMobile && <Sidebar />}
        {isMobile && (
          <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
        )}
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
