import { Router } from 'express';
import { formController } from './form.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { PERMISSIONS } from '@snapform/shared';
import {
  createFormSchema,
  updateFormSchema,
  formFieldsSchema,
  updateFormStatusSchema,
  formParamsSchema,
  formListSchema,
  trashParamsSchema,
} from './form.schema';
import { z } from 'zod';

const router = Router();

// Public route - get form by slug (for respondents)
/**
 * @swagger
 * /forms/{slug}:
 *   get:
 *     summary: Get published form by slug (public)
 *     tags: [Forms]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Form data }
 *       404: { description: Form not found }
 */
router.get(
  '/:slug',
  validate(z.object({ params: z.object({ slug: z.string().min(1) }) })),
  asyncHandler(formController.getPublicBySlug),
);

// Workspace-scoped routes (authenticated + RBAC)
/**
 * @swagger
 * /forms/workspace/{workspaceId}:
 *   post:
 *     summary: Create a new form
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Form created }
 */
router.post(
  '/workspace/:workspaceId',
  authenticate,
  validate(createFormSchema),
  requirePermission(PERMISSIONS.FORM_CREATE),
  asyncHandler(formController.create),
);

router.get(
  '/workspace/:workspaceId',
  authenticate,
  validate(formListSchema),
  requirePermission(PERMISSIONS.FORM_VIEW),
  asyncHandler(formController.list),
);

// Trash routes (must be before :formId routes to avoid matching "trash" as formId)
router.get(
  '/workspace/:workspaceId/trash',
  authenticate,
  validate(trashParamsSchema),
  requirePermission(PERMISSIONS.FORM_DELETE),
  asyncHandler(formController.listTrash),
);

router.delete(
  '/workspace/:workspaceId/trash',
  authenticate,
  validate(trashParamsSchema),
  requirePermission(PERMISSIONS.FORM_DELETE),
  asyncHandler(formController.emptyTrash),
);

router.get(
  '/workspace/:workspaceId/:formId',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_VIEW),
  asyncHandler(formController.getById),
);

router.patch(
  '/workspace/:workspaceId/:formId',
  authenticate,
  validate(updateFormSchema),
  requirePermission(PERMISSIONS.FORM_EDIT),
  asyncHandler(formController.update),
);

router.patch(
  '/workspace/:workspaceId/:formId/status',
  authenticate,
  validate(updateFormStatusSchema),
  requirePermission(PERMISSIONS.FORM_PUBLISH),
  asyncHandler(formController.updateStatus),
);

router.put(
  '/workspace/:workspaceId/:formId/fields',
  authenticate,
  validate(formFieldsSchema),
  requirePermission(PERMISSIONS.FORM_EDIT),
  asyncHandler(formController.replaceFields),
);

router.post(
  '/workspace/:workspaceId/:formId/duplicate',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_CREATE),
  asyncHandler(formController.duplicate),
);

router.post(
  '/workspace/:workspaceId/:formId/restore',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_DELETE),
  asyncHandler(formController.restore),
);

router.delete(
  '/workspace/:workspaceId/:formId/permanent',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_DELETE),
  asyncHandler(formController.permanentDelete),
);

router.delete(
  '/workspace/:workspaceId/:formId',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_DELETE),
  asyncHandler(formController.delete),
);

export default router;
