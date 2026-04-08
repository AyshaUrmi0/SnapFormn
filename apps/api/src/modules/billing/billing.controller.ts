import type { Request, Response } from 'express';
import { billingService } from './billing.service';
import { sendSuccess } from '../../utils/response';

export const billingController = {
  async createCheckout(req: Request, res: Response) {
    const userId = req.user!.sub;
    const result = await billingService.createCheckout(userId, req.body);
    sendSuccess(res, result, 'Checkout session created');
  },

  async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const result = await billingService.handleWebhook(req.body, signature || '');
    sendSuccess(res, result);
  },

  async createPortalSession(req: Request, res: Response) {
    const userId = req.user!.sub;
    const result = await billingService.createPortalSession(userId);
    sendSuccess(res, result, 'Portal session created');
  },
};
