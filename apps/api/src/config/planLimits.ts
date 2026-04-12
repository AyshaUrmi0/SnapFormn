import type { Plan } from '@prisma/client';

export interface PlanLimits {
  maxWorkspacesPerUser: number | null;
  maxForms: number | null;
  maxSubmissionsPerMonth: number | null;
  maxMembers: number | null;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxWorkspacesPerUser: 1,
    maxForms: 3,
    maxSubmissionsPerMonth: 100,
    maxMembers: 2,
  },
  PRO: {
    maxWorkspacesPerUser: null,
    maxForms: null,
    maxSubmissionsPerMonth: 10000,
    maxMembers: null,
  },
  BUSINESS: {
    maxWorkspacesPerUser: null,
    maxForms: null,
    maxSubmissionsPerMonth: null,
    maxMembers: null,
  },
};
