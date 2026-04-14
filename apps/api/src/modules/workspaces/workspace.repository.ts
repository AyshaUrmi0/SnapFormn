import { prisma } from '../../lib/prisma';
import type { Prisma, WorkspaceRole } from '@prisma/client';

export const workspaceRepository = {
  create(data: Prisma.WorkspaceCreateInput) {
    return prisma.workspace.create({ data });
  },

  findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, email: true, name: true } } } } },
    });
  },

  findBySlug(slug: string) {
    return prisma.workspace.findUnique({ where: { slug } });
  },

  findByUserId(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
      orderBy: { joinedAt: 'desc' },
    });
  },

  update(id: string, data: Prisma.WorkspaceUpdateInput) {
    return prisma.workspace.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.workspace.delete({ where: { id } });
  },

  addMember(workspaceId: string, userId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
    });
  },

  findMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  },

  findMemberById(id: string) {
    return prisma.workspaceMember.findUnique({ where: { id } });
  },

  updateMemberRole(id: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({ where: { id }, data: { role } });
  },

  removeMember(id: string) {
    return prisma.workspaceMember.delete({ where: { id } });
  },

  countMembers(workspaceId: string) {
    return prisma.workspaceMember.count({ where: { workspaceId } });
  },

  findOwnedByUser(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId, role: 'OWNER' },
      include: { workspace: { select: { id: true, plan: true } } },
    });
  },
};
