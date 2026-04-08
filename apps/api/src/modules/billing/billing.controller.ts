import type { Request, Response } from 'express';
import { billingService } from './billing.service';
import { sendSuccess } from '../../utils/response';

export const billingController = {
  async createCheckout(req: Request, res: Response) {
    const userId = req.user!.sub;
    const result = await billingService.createCheckout(userId, req.body);
    sendSuccess(res, result, 'Checkout session created');
  },

  async getSubscription(req: Request, res: Response) {
    const workspaceId = req.query.workspaceId as string;
    const result = await billingService.getSubscription(workspaceId);
    sendSuccess(res, result);
  },

  async createPortalSession(req: Request, res: Response) {
    const workspaceId = req.query.workspaceId as string;
    const result = await billingService.createPortalSession(workspaceId);
    sendSuccess(res, result, 'Portal session created');
  },

  async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody as Buffer;
    const result = await billingService.handleWebhook(rawBody, signature || '');
    sendSuccess(res, result);
  },
};
