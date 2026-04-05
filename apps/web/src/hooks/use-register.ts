'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { register as registerFn } from '@/modules/auth/auth.service';
import { getErrorMessage } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';
import type { RegisterValues } from '@/modules/auth/schemas';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterValues) => registerFn(data),
    onSuccess: (res) => {
      toast.success('Account created! Check your email for a verification code.');
      router.push(
        `${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(res.email)}&purpose=EMAIL_VERIFICATION`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
