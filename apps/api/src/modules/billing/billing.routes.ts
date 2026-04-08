import { Router, type RequestHandler } from 'express';
import { billingController } from './billing.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireBillingPermission } from './billing.middleware';
import { createCheckoutSchema } from './billing.schema';

const router = Router();

/**
 * @swagger
 * /billing/checkout:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, plan, period]
 *             properties:
 *               workspaceId: { type: string }
 *               plan: { type: string, enum: [PRO, BUSINESS] }
 *               period: { type: string, enum: [monthly, yearly] }
 *     responses:
 *       200: { description: Checkout session created }
 */
router.post(
  '/checkout',
  authenticate as RequestHandler,
  requireBillingPermission() as RequestHandler,
  validate(createCheckoutSchema),
  asyncHandler(billingController.createCheckout),
);

/**
 * @swagger
 * /billing/subscription:
 *   get:
 *     summary: Get subscription details for a workspace
 *     tags: [Billing]
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subscription details }
 */
router.get(
  '/subscription',
  authenticate as RequestHandler,
  asyncHandler(billingController.getSubscription),
);

/**
 * @swagger
 * /billing/portal:
 *   get:
 *     summary: Create a Stripe customer portal session
 *     tags: [Billing]
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Portal session created }
 */
router.get(
  '/portal',
  authenticate as RequestHandler,
  requireBillingPermission() as RequestHandler,
  asyncHandler(billingController.createPortalSession),
);

/**
 * @swagger
 * /billing/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     tags: [Billing]
 *     security: []
 *     responses:
 *       200: { description: Webhook received }
 */
router.post('/webhook', asyncHandler(billingController.webhook));

export default router;
