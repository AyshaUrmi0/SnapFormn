'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestOtp as requestOtpFn } from '@/modules/auth/auth.service';
import { getErrorMessage } from '@/lib/errors';
import type { OtpPurpose } from '@/modules/auth/types';

export function useRequestOtp() {
  return useMutation({
    mutationFn: (data: { email: string; purpose: OtpPurpose }) =>
      requestOtpFn(data),
    onSuccess: () => {
      toast.success('Verification code sent to your email.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
