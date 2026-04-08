import { createApi, methodsEnums } from '@/lib/createApi';
import type {
  CreateCheckoutKeys,
  CheckoutResponse,
  GetPortalKeys,
  PortalResponse,
  SubscriptionInfo,
} from './types';

const { GET, POST } = methodsEnums;

function createCheckoutRequest(data: CreateCheckoutKeys) {
  return { url: '/billing/checkout', method: POST, data };
}

export const createCheckout = createApi<CreateCheckoutKeys, CheckoutResponse>({
  request: createCheckoutRequest,
});

function getPortalRequest(data: GetPortalKeys) {
  return { url: '/billing/portal', method: GET, params: { workspaceId: data.workspaceId } };
}

export const getPortal = createApi<GetPortalKeys, PortalResponse>({
  request: getPortalRequest,
});

function getSubscriptionRequest(data: { workspaceId: string }) {
  return { url: '/billing/subscription', method: GET, params: { workspaceId: data.workspaceId } };
}

export const getSubscription = createApi<{ workspaceId: string }, SubscriptionInfo | null>({
  request: getSubscriptionRequest,
});
