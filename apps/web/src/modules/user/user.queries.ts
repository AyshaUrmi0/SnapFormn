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

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: (data: { newEmail: string; password: string }) =>
      api.post<{ changeToken: string; sent: boolean }>('/auth/request-email-change', data),
    onSuccess: () => {
      toast.success('Verification code sent to your new email.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useVerifyEmailChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { changeToken: string; code: string }) =>
      api.post('/auth/verify-email-change', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      toast.success('Email changed successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password changed successfully');
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
