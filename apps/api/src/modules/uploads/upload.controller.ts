import type { Request, Response } from 'express';
import { AppError } from '@snapform/shared';
import { uploadService } from './upload.service';
import { sendSuccess } from '../../utils/response';
import { prisma } from '../../lib/prisma';

export const uploadController = {
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
