'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When user is authenticated and viewing product or help pages (e.g. /templates, /whats-new, /roadmap, /guides, /help-center),
  // preserve the consistent dashboard sidebar shell rather than abruptly switching to the public marketing navbar.
  const isMarketingRoot = pathname === '/' || pathname === '/sandbox';
  const shouldUseDashboard = mounted && isAuthenticated && !isMarketingRoot;

  if (shouldUseDashboard) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
