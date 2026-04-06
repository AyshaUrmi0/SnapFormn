'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import { queryKeys } from '@/constants/query-keys';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; avatarUrl?: string }) =>
      api.patch('/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.del('/users/me'),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
