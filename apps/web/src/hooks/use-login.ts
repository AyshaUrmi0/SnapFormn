'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login as loginFn } from '@/modules/auth/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';
import type { LoginKeys } from '@/modules/auth/types';

export function useLogin() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: LoginKeys) => loginFn(data),
    onSuccess: (res) => {
      setSession(res.accessToken);
      toast.success('Welcome back!');
      router.push(ROUTES.WORKSPACES);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
