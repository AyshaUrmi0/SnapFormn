import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@snapform/shared';
import { prisma } from '../../lib/prisma';

/**
 * Checks that the authenticated user is an OWNER or ADMIN of the workspace
 * specified in req.body.workspaceId or req.query.workspaceId.
 */
export function requireBillingPermission() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.user?.sub;
    if (!userId) throw AppError.unauthorized();

    const workspaceId = (req.body?.workspaceId || req.query?.workspaceId) as string | undefined;
    if (!workspaceId) throw AppError.badRequest('workspaceId is required');

    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!member) throw AppError.forbidden('Not a member of this workspace');
    if (!['OWNER', 'ADMIN'].includes(member.role)) {
      throw AppError.forbidden('Insufficient permissions for billing');
    }

    next();
  };
}
