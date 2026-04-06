'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/shared/auth-guard';
import { ModalProvider } from '@/providers/modal-provider';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <ModalProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile sidebar */}
        <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile-only topbar with hamburger */}
          <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      </ModalProvider>
    </AuthGuard>
  );
}
