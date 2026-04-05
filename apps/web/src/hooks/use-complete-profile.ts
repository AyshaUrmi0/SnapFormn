'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { completeProfile as completeProfileFn } from '@/modules/auth/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

export function useCompleteProfile() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; password: string }) =>
      completeProfileFn(data),
    onSuccess: (res) => {
      setSession(res.accessToken);
      toast.success('Profile completed! Welcome to Snapform.');
      router.push(ROUTES.WORKSPACES);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
