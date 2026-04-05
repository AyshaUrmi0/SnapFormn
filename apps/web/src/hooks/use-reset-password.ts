'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { resetPassword as resetPasswordFn } from '@/modules/auth/auth.service';
import { getErrorMessage } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { resetToken: string; newPassword: string }) =>
      resetPasswordFn(data),
    onSuccess: () => {
      toast.success('Password reset successfully! Please sign in.');
      router.push(ROUTES.LOGIN);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
