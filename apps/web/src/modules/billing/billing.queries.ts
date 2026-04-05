'use client';

import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';
import { createCheckout, getPortal } from './billing.service';
import type {
  CreateCheckoutKeys,
  CheckoutResponse,
  PortalResponse,
} from './types';

export const useCreateCheckout = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutKeys>({
    mutationFn: (params: CreateCheckoutKeys) => createCheckout(params),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useGetPortal = () => {
  return useMutation<PortalResponse, Error, void>({
    mutationFn: () => getPortal(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
