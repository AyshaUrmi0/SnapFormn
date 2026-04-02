import { api } from '@/lib/api-client';

export const billingService = {
  createCheckout: (data: { workspaceId: string; plan: 'PRO' | 'BUSINESS' }) =>
    api.post<{ url: string }>('/billing/checkout', data),

  getPortal: () => api.get<{ url: string }>('/billing/portal'),
};
