'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { env } from '@/lib/env';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider delay={300}>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </GoogleOAuthProvider>
  );
}
