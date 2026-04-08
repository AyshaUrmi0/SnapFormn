export interface CreateCheckoutKeys {
  workspaceId: string;
  plan: 'PRO' | 'BUSINESS';
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}
