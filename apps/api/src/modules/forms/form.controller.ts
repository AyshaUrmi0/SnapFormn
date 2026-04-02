import type { Request, Response } from 'express';
import { formService } from './form.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';

export const formController = {
  async create(req: Request, res: Response) {
    const userId = req.user!.sub;
    const form = await formService.create(req.params.workspaceId as string, userId, req.body);
    sendCreated(res, form, 'Form created');
  },

  async list(req: Request, res: Response) {
    const { page, limit, status } = req.query as Record<string, string>;
    const { forms, meta } = await formService.list(
      req.params.workspaceId as string,
      Number(page),
      Number(limit),
      status as any,
    );
    sendPaginated(res, forms, meta);
  },

  async getById(req: Request, res: Response) {
    const form = await formService.getById(req.params.formId as string);
    sendSuccess(res, form);
  },

  async getPublicBySlug(req: Request, res: Response) {
    const form = await formService.getPublicBySlug(req.params.slug as string);
    sendSuccess(res, form);
  },

  async update(req: Request, res: Response) {
    const form = await formService.update(req.params.formId as string, req.body);
    sendSuccess(res, form, 'Form updated');
  },

  async updateStatus(req: Request, res: Response) {
    const form = await formService.updateStatus(req.params.formId as string, req.body.status);
    sendSuccess(res, form, 'Form status updated');
  },

  async replaceFields(req: Request, res: Response) {
    const fields = await formService.replaceFields(req.params.formId as string, req.body.fields);
    sendSuccess(res, fields, 'Form fields updated');
  },

  async delete(req: Request, res: Response) {
    await formService.delete(req.params.formId as string);
    sendNoContent(res);
  },
};
