import { AppError } from '@snapform/shared';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { env } from '../../config/env';
import { stripe, PRICE_IDS, planFromPriceId } from './stripe';
import { billingRepository } from './billing.repository';
import type { CreateCheckoutInput } from './billing.types';
import type Stripe from 'stripe';

export const billingService = {
  async createCheckout(userId: string, input: CreateCheckoutInput) {
    const { workspaceId, plan, period } = input;

    // Get the user's email for creating a Stripe customer
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw AppError.notFound('User not found');

    // Get workspace for success URL
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { slug: true } });
    if (!workspace) throw AppError.notFound('Workspace not found');

    // Reuse existing Stripe customer if workspace already has a subscription
    const existing = await billingRepository.findByWorkspaceId(workspaceId);
    let customerId = existing?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { workspaceId, userId },
      });
      customerId = customer.id;
    }

    const priceId = PRICE_IDS[plan][period];
    if (!priceId) throw AppError.badRequest('Invalid plan or period');

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { workspaceId, userId, plan },
      subscription_data: { metadata: { workspaceId } },
      success_url: `${env.FRONTEND_URL}/${workspace.slug}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/upgrade`,
      allow_promotion_codes: true,
    });

    return { url: session.url };
  },

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error({ err }, 'Stripe webhook signature verification failed');
      throw AppError.badRequest('Invalid webhook signature');
    }

    logger.info({ type: event.type, id: event.id }, 'Stripe webhook received');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const workspaceId = session.metadata?.workspaceId;
        if (!workspaceId) {
          logger.warn({ sessionId: session.id }, 'Checkout session missing workspaceId metadata');
          break;
        }

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id ?? '';
        const plan = planFromPriceId(priceId);

        await billingRepository.upsertByWorkspaceId(workspaceId, {
          workspaceId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });

        if (plan) {
          await billingRepository.updateWorkspacePlan(workspaceId, plan);
        }

        logger.info({ workspaceId, plan }, 'Subscription created via checkout');
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId;

        const dbSub = await billingRepository.findByStripeSubscriptionId(sub.id);
        if (!dbSub) {
          logger.warn({ subId: sub.id }, 'Subscription not found in DB for update');
          break;
        }

        const priceId = sub.items.data[0]?.price.id ?? dbSub.stripePriceId;
        const status = mapStripeStatus(sub.status);

        await billingRepository.updateByStripeSubscriptionId(sub.id, {
          stripePriceId: priceId,
          status,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });

        // Update workspace plan if price changed
        const plan = planFromPriceId(priceId);
        const targetWorkspaceId = workspaceId || dbSub.workspaceId;

        if (status === 'CANCELED') {
          await billingRepository.updateWorkspacePlan(targetWorkspaceId, 'FREE');
        } else if (plan) {
          await billingRepository.updateWorkspacePlan(targetWorkspaceId, plan);
        }

        logger.info({ subId: sub.id, status, plan }, 'Subscription updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const dbSub = await billingRepository.findByStripeSubscriptionId(sub.id);
        if (!dbSub) break;

        await billingRepository.updateByStripeSubscriptionId(sub.id, {
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
        });
        await billingRepository.updateWorkspacePlan(dbSub.workspaceId, 'FREE');

        logger.info({ workspaceId: dbSub.workspaceId }, 'Subscription deleted, reverted to FREE');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const dbSub = await billingRepository.findByStripeSubscriptionId(invoice.subscription as string);
        if (!dbSub) break;

        await billingRepository.updateByStripeSubscriptionId(invoice.subscription as string, {
          status: 'ACTIVE',
          currentPeriodStart: new Date(invoice.period_start * 1000),
          currentPeriodEnd: new Date(invoice.period_end * 1000),
        });

        logger.info({ subId: invoice.subscription }, 'Invoice payment succeeded');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const dbSub = await billingRepository.findByStripeSubscriptionId(invoice.subscription as string);
        if (!dbSub) break;

        await billingRepository.updateByStripeSubscriptionId(invoice.subscription as string, {
          status: 'PAST_DUE',
        });

        logger.warn({ subId: invoice.subscription }, 'Invoice payment failed');
        break;
      }

      default:
        logger.debug({ type: event.type }, 'Unhandled webhook event type');
    }

    return { received: true };
  },

  async createPortalSession(workspaceId: string) {
    const subscription = await billingRepository.findByWorkspaceId(workspaceId);
    if (!subscription) throw AppError.notFound('No active subscription found');

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { slug: true } });

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/${workspace?.slug ?? workspaceId}/billing`,
    });

    return { url: session.url };
  },

  async getSubscription(workspaceId: string) {
    if (!workspaceId) return null;

    const subscription = await billingRepository.findByWorkspaceId(workspaceId);
    if (!subscription) return null;

    return {
      status: subscription.status,
      plan: planFromPriceId(subscription.stripePriceId),
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  },
};

function mapStripeStatus(status: Stripe.Subscription.Status): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING' {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'past_due': return 'PAST_DUE';
    case 'canceled': return 'CANCELED';
    case 'incomplete': return 'INCOMPLETE';
    case 'incomplete_expired': return 'CANCELED';
    case 'trialing': return 'TRIALING';
    case 'unpaid': return 'PAST_DUE';
    case 'paused': return 'ACTIVE';
    default: return 'ACTIVE';
  }
}
