export interface CreateCheckoutKeys {
  workspaceId: string;
  plan: 'PRO' | 'BUSINESS';
  period: 'monthly' | 'yearly';
}

export interface CheckoutResponse {
  url: string;
}

export interface GetPortalKeys {
  workspaceId: string;
}

export interface PortalResponse {
  url: string;
}

export interface SubscriptionInfo {
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';
  plan: 'PRO' | 'BUSINESS' | null;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
