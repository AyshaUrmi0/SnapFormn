import { createApi, methodsEnums } from '@/lib/createApi';
import type {
  CreateCheckoutKeys,
  CheckoutResponse,
  PortalResponse,
} from './types';

const { GET, POST } = methodsEnums;

function createCheckoutRequest(data: CreateCheckoutKeys) {
  return { url: '/billing/checkout', method: POST, data };
}

export const createCheckout = createApi<CreateCheckoutKeys, CheckoutResponse>({
  request: createCheckoutRequest,
});

function getPortalRequest() {
  return { url: '/billing/portal', method: GET };
}

export const getPortal = createApi<void, PortalResponse>({
  request: getPortalRequest,
});
