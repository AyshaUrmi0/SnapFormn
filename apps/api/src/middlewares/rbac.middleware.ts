import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@snapform/shared';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const CACHE_TTL_SECONDS = 300; // 5 minutes

export function requirePermission(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.user?.sub;
    if (!userId) throw AppError.unauthorized();

    const workspaceId = req.params.workspaceId as string | undefined;
    if (!workspaceId) throw AppError.badRequest('workspaceId is required');

    const cacheKey = `rbac:${userId}:${workspaceId}`;
    let permissions: string[];

    const cached = await redis.get(cacheKey);
    if (cached) {
      permissions = JSON.parse(cached);
    } else {
      const member = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
      });
      if (!member) throw AppError.forbidden('Not a member of this workspace');

      const rolePerms = await prisma.rolePermission.findMany({
        where: { role: { name: member.role } },
        include: { permission: true },
      });
      permissions = rolePerms.map((rp) => rp.permission.action);
      await redis.set(cacheKey, JSON.stringify(permissions), 'EX', CACHE_TTL_SECONDS);
    }

    const hasAll = requiredPermissions.every((p) => permissions.includes(p));
    if (!hasAll) throw AppError.forbidden('Insufficient permissions');

    next();
  };
}
