export interface CreateCheckoutInput {
  workspaceId: string;
  plan: 'PRO' | 'BUSINESS';
  period: 'monthly' | 'yearly';
}
