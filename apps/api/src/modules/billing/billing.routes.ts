import { Router } from 'express';
import { billingController } from './billing.controller';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { createCheckoutSchema } from './billing.schema';

const router = Router();

/**
 * @swagger
 * /billing/checkout:
 *   post:
 *     summary: Create a Stripe checkout session (stub)
 *     tags: [Billing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, plan]
 *             properties:
 *               workspaceId: { type: string }
 *               plan: { type: string, enum: [PRO, BUSINESS] }
 *     responses:
 *       200: { description: Checkout session created }
 */
router.post('/checkout', validate(createCheckoutSchema), asyncHandler(billingController.createCheckout));

/**
 * @swagger
 * /billing/portal:
 *   get:
 *     summary: Create a Stripe customer portal session (stub)
 *     tags: [Billing]
 *     responses:
 *       200: { description: Portal session created }
 */
router.get('/portal', asyncHandler(billingController.createPortalSession));

// Webhook - uses raw body, no auth middleware
router.post('/webhook', asyncHandler(billingController.webhook));

export default router;
