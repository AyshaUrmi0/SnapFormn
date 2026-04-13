import { Router } from 'express';
import { workspaceController } from './workspace.controller';
import { validate } from '../../middlewares/validate.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { PERMISSIONS } from '@snapform/shared';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  workspaceParamsSchema,
  memberParamsSchema,
} from './workspace.schema';

const router = Router();

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *     responses:
 *       201: { description: Workspace created }
 */
router.post('/', validate(createWorkspaceSchema), asyncHandler(workspaceController.create));

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: List user's workspaces
 *     tags: [Workspaces]
 *     responses:
 *       200: { description: List of workspaces }
 */
router.get('/', asyncHandler(workspaceController.list));

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   get:
 *     summary: Get workspace details
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Workspace details }
 */
router.get(
  '/:workspaceId',
  validate(workspaceParamsSchema),
  requirePermission(PERMISSIONS.FORM_VIEW),
  asyncHandler(workspaceController.getById),
);

router.get(
  '/:workspaceId/usage',
  validate(workspaceParamsSchema),
  requirePermission(PERMISSIONS.FORM_VIEW),
  asyncHandler(workspaceController.getUsage),
);

router.patch(
  '/:workspaceId',
  validate(updateWorkspaceSchema),
  requirePermission(PERMISSIONS.WORKSPACE_MANAGE),
  asyncHandler(workspaceController.update),
);

router.delete(
  '/:workspaceId',
  validate(workspaceParamsSchema),
  requirePermission(PERMISSIONS.WORKSPACE_DELETE),
  asyncHandler(workspaceController.delete),
);

// Member management
router.post(
  '/:workspaceId/members',
  validate(inviteMemberSchema),
  requirePermission(PERMISSIONS.MEMBER_INVITE),
  asyncHandler(workspaceController.inviteMember),
);

router.patch(
  '/:workspaceId/members/:memberId',
  validate(updateMemberRoleSchema),
  requirePermission(PERMISSIONS.MEMBER_MANAGE_ROLE),
  asyncHandler(workspaceController.updateMemberRole),
);

router.delete(
  '/:workspaceId/members/:memberId',
  validate(memberParamsSchema),
  requirePermission(PERMISSIONS.MEMBER_REMOVE),
  asyncHandler(workspaceController.removeMember),
);

export default router;
