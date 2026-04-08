'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';
import { queryKeys } from '@/constants/query-keys';
import { toast } from 'sonner';
import { createCheckout, getPortal, getSubscription } from './billing.service';
import type {
  CreateCheckoutKeys,
  CheckoutResponse,
  GetPortalKeys,
  PortalResponse,
  SubscriptionInfo,
} from './types';

export const useSubscription = (workspaceId: string) => {
  return useQuery<SubscriptionInfo | null, Error>({
    queryKey: queryKeys.billing.subscription(workspaceId),
    queryFn: () => getSubscription({ workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useCreateCheckout = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutKeys>({
    mutationFn: (params: CreateCheckoutKeys) => createCheckout(params),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useGetPortal = () => {
  return useMutation<PortalResponse, Error, GetPortalKeys>({
    mutationFn: (params: GetPortalKeys) => getPortal(params),
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
