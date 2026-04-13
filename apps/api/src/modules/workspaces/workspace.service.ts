import { AppError, slugify } from '@snapform/shared';
import type { WorkspaceRole } from '@prisma/client';
import { workspaceRepository } from './workspace.repository';
import { prisma } from '../../lib/prisma';
import { PLAN_LIMITS } from '../../config/planLimits';
import { formRepository } from '../forms/form.repository';
import { submissionRepository } from '../submissions/submission.repository';
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspace.types';

export const workspaceService = {
  async create(userId: string, input: CreateWorkspaceInput) {
    // Enforce workspace limit. Users with at least one paid (PRO/BUSINESS)
    // workspace can create unlimited new ones. Users who only own FREE
    // workspaces are capped at PLAN_LIMITS.FREE.maxWorkspacesPerUser.
    const owned = await workspaceRepository.findOwnedByUser(userId);
    const hasPaidWorkspace = owned.some(
      (m) => m.workspace.plan === 'PRO' || m.workspace.plan === 'BUSINESS',
    );
    const freeLimit = PLAN_LIMITS.FREE.maxWorkspacesPerUser;
    if (!hasPaidWorkspace && freeLimit !== null && owned.length >= freeLimit) {
      throw AppError.planLimitExceeded(
        `Free plan allows only ${freeLimit} workspace. Upgrade an existing workspace to create more.`,
      );
    }

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

  async getUsage(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });
    if (!workspace) throw AppError.notFound('Workspace not found');

    const limits = PLAN_LIMITS[workspace.plan];

    const [formsCount, submissionsCount, membersCount, ownedWorkspaces] = await Promise.all([
      formRepository.countByWorkspace(workspaceId),
      submissionRepository.countByWorkspaceThisMonth(workspaceId),
      workspaceRepository.countMembers(workspaceId),
      workspaceRepository.findOwnedByUser(userId),
    ]);

    const freeOwnedCount = ownedWorkspaces.filter((m) => m.workspace.plan === 'FREE').length;

    return {
      plan: workspace.plan,
      forms: { current: formsCount, limit: limits.maxForms },
      submissionsThisMonth: { current: submissionsCount, limit: limits.maxSubmissionsPerMonth },
      members: { current: membersCount, limit: limits.maxMembers },
      workspacesOwned: { current: freeOwnedCount, limit: PLAN_LIMITS.FREE.maxWorkspacesPerUser },
    };
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
    // Enforce member limit
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });
    if (!workspace) throw AppError.notFound('Workspace not found');

    const limit = PLAN_LIMITS[workspace.plan].maxMembers;
    if (limit !== null) {
      const current = await workspaceRepository.countMembers(workspaceId);
      if (current >= limit) {
        throw AppError.planLimitExceeded(
          `${workspace.plan} plan is limited to ${limit} members. Upgrade to invite more.`,
        );
      }
    }

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
