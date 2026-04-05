'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout as logoutFn } from '@/modules/auth/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';

export function useLogout() {
  const router = useRouter();
  const { clearSession } = useAuth();

  return useMutation({
    mutationFn: () => logoutFn(),
    onSettled: () => {
      clearSession();
      router.push(ROUTES.LOGIN);
    },
  });
}
