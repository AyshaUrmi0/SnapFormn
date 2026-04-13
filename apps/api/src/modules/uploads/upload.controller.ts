import type { Request, Response } from 'express';
import { AppError } from '@snapform/shared';
import { uploadService } from './upload.service';
import { sendSuccess } from '../../utils/response';
import { prisma } from '../../lib/prisma';

export const uploadController = {
  /**
   * Authenticated sign endpoint — used by form owners when they upload
   * media into blocks (Image / Video / Audio / Embed src fields) inside
   * the editor. Verifies the user is a member of the workspace that owns
   * the form.
   */
  async signForOwner(req: Request, res: Response) {
    const userId = req.user!.sub;
    const { formId, fieldId, resourceType } = req.body;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { workspaceId: true },
    });
    if (!form) throw AppError.notFound('Form not found');

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: form.workspaceId } },
    });
    if (!member) throw AppError.forbidden('Not a member of this workspace');

    const payload = uploadService.signUploadParams({ formId, fieldId, resourceType });
    sendSuccess(res, payload, 'Upload signed');
  },

  /**
   * Public sign endpoint — used by anonymous respondents when they upload
   * a file to a published form. The form must be PUBLISHED. Rate limited
   * by the global rate limiter on the API.
   */
  async signForRespondent(req: Request, res: Response) {
    const { slug, fieldId, resourceType } = req.body;

    const form = await prisma.form.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    });
    if (!form) throw AppError.notFound('Form not found or not published');

    const payload = uploadService.signUploadParams({
      formId: form.id,
      fieldId,
      resourceType,
    });
    sendSuccess(res, payload, 'Upload signed');
  },
};
