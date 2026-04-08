import Stripe from 'stripe';
import { env } from '../../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const PRICE_IDS = {
  PRO: {
    monthly: env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: env.STRIPE_PRICE_PRO_YEARLY,
  },
  BUSINESS: {
    monthly: env.STRIPE_PRICE_BUSINESS_MONTHLY,
    yearly: env.STRIPE_PRICE_BUSINESS_YEARLY,
  },
} as const;

export type BillingPeriod = 'monthly' | 'yearly';

/** Reverse lookup: Stripe price ID → plan name */
export function planFromPriceId(priceId: string): 'PRO' | 'BUSINESS' | null {
  for (const [plan, prices] of Object.entries(PRICE_IDS)) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return plan as 'PRO' | 'BUSINESS';
    }
  }
  return null;
}
