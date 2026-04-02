import { logger } from '../../lib/logger';
import type { CreateCheckoutInput } from './billing.types';

export const billingService = {
  async createCheckout(userId: string, input: CreateCheckoutInput) {
    // TODO: Integrate with Stripe
    logger.info({ userId, input }, 'Billing: createCheckout called (stub)');
    return {
      checkoutUrl: 'https://checkout.stripe.com/stub',
      sessionId: 'stub_session_id',
    };
  },

  async handleWebhook(payload: Buffer, signature: string) {
    // TODO: Verify Stripe webhook signature and handle events
    logger.info({ signature: signature.slice(0, 20) }, 'Billing: webhook received (stub)');
    return { received: true };
  },

  async createPortalSession(userId: string) {
    // TODO: Create Stripe customer portal session
    logger.info({ userId }, 'Billing: createPortalSession called (stub)');
    return {
      portalUrl: 'https://billing.stripe.com/stub',
    };
  },
};
