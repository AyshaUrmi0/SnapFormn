'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/shared/auth-guard';
import { ModalProvider } from '@/providers/modal-provider';
import { CommandPaletteProvider } from '@/providers/command-palette-provider';
import { PlanProvider } from '@/providers/plan-provider';
import { CommandPalette } from '@/components/command-palette';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <PlanProvider>
      <ModalProvider>
      <CommandPaletteProvider>
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

      <CommandPalette />
      </CommandPaletteProvider>
      </ModalProvider>
      </PlanProvider>
    </AuthGuard>
  );
}
