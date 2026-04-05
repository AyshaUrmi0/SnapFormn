'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { googleLogin as googleLoginFn } from '@/modules/auth/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

export function useGoogleLogin() {
  const router = useRouter();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (idToken: string) => googleLoginFn({ accessToken: idToken }),
    onSuccess: (res) => {
      setSession(res.accessToken);
      toast.success('Welcome!');
      router.push(ROUTES.WORKSPACES);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
