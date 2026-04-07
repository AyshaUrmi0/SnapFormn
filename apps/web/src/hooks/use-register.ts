'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { register as registerFn } from '@/modules/auth/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';
import type { RegisterValues } from '@/modules/auth/schemas';

export function useRegister() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterValues) => registerFn(data),
    onSuccess: (res) => {
      setSession(res.accessToken);
      toast.success('Account created!');
      router.push(ROUTES.WORKSPACES);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
