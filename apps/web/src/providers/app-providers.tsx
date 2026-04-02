'use client';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider delay={300}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </TooltipProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
