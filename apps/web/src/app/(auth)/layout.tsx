'use client';

import { GuestGuard } from '@/components/shared/guest-guard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <GuestGuard>{children}</GuestGuard>
      </div>
    </div>
  );
}
