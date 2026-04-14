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

/**
 * @swagger
 * /workspaces/{workspaceId}/usage:
 *   get:
 *     summary: Get workspace plan usage and limits
 *     description: |
 *       Returns current usage counts for forms, submissions this month, and
 *       members, plus the matching plan limits. `null` limit means unlimited.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usage details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/WorkspaceUsage' }
 */
router.get(
  '/:workspaceId/usage',
  validate(workspaceParamsSchema),
  requirePermission(PERMISSIONS.FORM_VIEW),
  asyncHandler(workspaceController.getUsage),
);

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   patch:
 *     summary: Update workspace name or settings
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Workspace updated }
 *   delete:
 *     summary: Delete a workspace (and all its forms, submissions, members)
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Workspace deleted }
 */
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

/**
 * @swagger
 * /workspaces/{workspaceId}/members:
 *   post:
 *     summary: Invite a member to the workspace
 *     description: Subject to the workspace plan's member limit.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [OWNER, ADMIN, EDITOR, VIEWER] }
 *     responses:
 *       201: { description: Member invited }
 *       403: { description: Plan member limit exceeded }
 */
router.post(
  '/:workspaceId/members',
  validate(inviteMemberSchema),
  requirePermission(PERMISSIONS.MEMBER_INVITE),
  asyncHandler(workspaceController.inviteMember),
);

/**
 * @swagger
 * /workspaces/{workspaceId}/members/{memberId}:
 *   patch:
 *     summary: Update a member's role
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [OWNER, ADMIN, EDITOR, VIEWER] }
 *     responses:
 *       200: { description: Role updated }
 *   delete:
 *     summary: Remove a member from the workspace
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Member removed }
 */
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
