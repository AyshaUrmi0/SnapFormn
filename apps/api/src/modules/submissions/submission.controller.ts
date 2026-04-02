import type { Request, Response } from 'express';
import { submissionService } from './submission.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';

export const submissionController = {
  async submit(req: Request, res: Response) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const submission = await submissionService.submit(req.params.slug as string, req.body, ip, userAgent);
    sendCreated(res, { submissionId: submission.id }, 'Submission received');
  },

  async list(req: Request, res: Response) {
    const { page, limit } = req.query as Record<string, string>;
    const { submissions, meta } = await submissionService.list(req.params.formId as string, Number(page), Number(limit));
    sendPaginated(res, submissions, meta);
  },

  async getById(req: Request, res: Response) {
    const submission = await submissionService.getById(req.params.submissionId as string);
    sendSuccess(res, submission);
  },

  async delete(req: Request, res: Response) {
    await submissionService.delete(req.params.submissionId as string);
    sendNoContent(res);
  },
};
