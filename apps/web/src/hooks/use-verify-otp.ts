'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { verifyOtp as verifyOtpFn } from '@/modules/auth/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { setAccessToken } from '@/lib/api-client';
import { ROUTES } from '@/constants/routes';
import type { OtpPurpose } from '@/modules/auth/types';

export function useVerifyOtp() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: { email: string; code: string; purpose: OtpPurpose }) =>
      verifyOtpFn(data),
    onSuccess: (res, variables) => {
      switch (variables.purpose) {
        case 'EMAIL_VERIFICATION':
          toast.success('Email verified! You can now sign in.');
          router.push(ROUTES.LOGIN);
          break;
        case 'LOGIN':
          if (res.accessToken && res.profileComplete) {
            setSession(res.accessToken);
            toast.success('Welcome back!');
            router.push(ROUTES.WORKSPACES);
          } else if (res.accessToken && !res.profileComplete) {
            // Store the temporary token so the complete-profile API call is authenticated
            setAccessToken(res.accessToken);
            router.push(
              `${ROUTES.COMPLETE_PROFILE}?email=${encodeURIComponent(variables.email)}`,
            );
          }
          break;
        case 'PASSWORD_RESET':
          if (res.resetToken) {
            router.push(
              `${ROUTES.RESET_PASSWORD}?token=${encodeURIComponent(res.resetToken)}`,
            );
          }
          break;
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
