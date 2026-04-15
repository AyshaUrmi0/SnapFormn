import type { Request, Response } from 'express';
import { submissionService } from './submission.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';
import { logger } from '../../lib/logger';

function extractClientIp(req: Request): string | undefined {
  // X-Forwarded-For is "client, proxy1, proxy2" — the first entry is the
  // real client. We read it ourselves rather than relying solely on req.ip
  // because Render's proxy chain depth can vary and we want a deterministic
  // result for server-side geo lookup.
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.ip || req.socket.remoteAddress || undefined;
}

export const submissionController = {
  async submit(req: Request, res: Response) {
    const ip = extractClientIp(req);
    const userAgent = req.headers['user-agent'];
    logger.info(
      { ip, xff: req.headers['x-forwarded-for'], reqIp: req.ip },
      'submission.submit ip resolution',
    );
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

  async analytics(req: Request, res: Response) {
    const days = Number(req.query.days) || 30;
    const data = await submissionService.getAnalytics(req.params.formId as string, days);
    sendSuccess(res, data);
  },

  async delete(req: Request, res: Response) {
    await submissionService.delete(req.params.submissionId as string);
    sendNoContent(res);
  },
};
