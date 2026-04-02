import { AppError, slugify } from '@snapform/shared';
import type { WorkspaceRole } from '@prisma/client';
import { workspaceRepository } from './workspace.repository';
import { prisma } from '../../lib/prisma';
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspace.types';

export const workspaceService = {
  async create(userId: string, input: CreateWorkspaceInput) {
    const slug = input.slug || slugify(input.name);

    const existing = await workspaceRepository.findBySlug(slug);
    if (existing) throw AppError.conflict('Workspace slug already taken');

    // Create workspace and add creator as OWNER in a transaction
    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: { name: input.name, slug },
      });
      await tx.workspaceMember.create({
        data: { workspaceId: ws.id, userId, role: 'OWNER' },
      });
      return ws;
    });

    return workspace;
  },

  async listByUser(userId: string) {
    const memberships = await workspaceRepository.findByUserId(userId);
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  },

  async getById(workspaceId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw AppError.notFound('Workspace not found');
    return workspace;
  },

  async update(workspaceId: string, input: UpdateWorkspaceInput) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw AppError.notFound('Workspace not found');

    if (input.slug) {
      const existing = await workspaceRepository.findBySlug(input.slug);
      if (existing && existing.id !== workspaceId) {
        throw AppError.conflict('Workspace slug already taken');
      }
    }

    return workspaceRepository.update(workspaceId, input);
  },

  async delete(workspaceId: string, userId: string) {
    const member = await workspaceRepository.findMember(workspaceId, userId);
    if (!member || member.role !== 'OWNER') {
      throw AppError.forbidden('Only the workspace owner can delete it');
    }

    await workspaceRepository.delete(workspaceId);
  },

  async inviteMember(workspaceId: string, email: string, role: WorkspaceRole) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw AppError.notFound('User with this email not found');

    const existing = await workspaceRepository.findMember(workspaceId, user.id);
    if (existing) throw AppError.conflict('User is already a member of this workspace');

    return workspaceRepository.addMember(workspaceId, user.id, role);
  },

  async updateMemberRole(memberId: string, role: WorkspaceRole) {
    const member = await workspaceRepository.findMemberById(memberId);
    if (!member) throw AppError.notFound('Member not found');

    if (member.role === 'OWNER') {
      throw AppError.forbidden('Cannot change the role of the workspace owner');
    }

    return workspaceRepository.updateMemberRole(memberId, role);
  },

  async removeMember(memberId: string) {
    const member = await workspaceRepository.findMemberById(memberId);
    if (!member) throw AppError.notFound('Member not found');

    if (member.role === 'OWNER') {
      throw AppError.forbidden('Cannot remove the workspace owner');
    }

    await workspaceRepository.removeMember(memberId);
  },
};
