import { prisma } from '../../lib/prisma';
import type { Prisma, Plan } from '@prisma/client';

export const billingRepository = {
  findByWorkspaceId(workspaceId: string) {
    return prisma.subscription.findUnique({ where: { workspaceId } });
  },

  findByStripeSubscriptionId(stripeSubscriptionId: string) {
    return prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
  },

  upsertByWorkspaceId(workspaceId: string, data: Prisma.SubscriptionUncheckedCreateInput) {
    return prisma.subscription.upsert({
      where: { workspaceId },
      create: data,
      update: {
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId: data.stripePriceId,
        status: data.status,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      },
    });
  },

  updateByStripeSubscriptionId(stripeSubscriptionId: string, data: Prisma.SubscriptionUpdateInput) {
    return prisma.subscription.update({
      where: { stripeSubscriptionId },
      data,
    });
  },

  updateWorkspacePlan(workspaceId: string, plan: Plan) {
    return prisma.workspace.update({ where: { id: workspaceId }, data: { plan } });
  },
};
