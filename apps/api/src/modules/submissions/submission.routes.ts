import { Router } from 'express';
import { submissionController } from './submission.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { PERMISSIONS } from '@snapform/shared';
import { submitFormSchema, listSubmissionsSchema, submissionParamsSchema } from './submission.schema';

const router = Router();

// Public route - submit a form
/**
 * @swagger
 * /submissions/{slug}:
 *   post:
 *     summary: Submit a form (public)
 *     tags: [Submissions]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fields]
 *             properties:
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fieldId: { type: string }
 *                     value: {}
 *     responses:
 *       201: { description: Submission received }
 */
router.post(
  '/:slug',
  validate(submitFormSchema),
  asyncHandler(submissionController.submit),
);

// Authenticated routes - manage submissions
router.get(
  '/workspace/:workspaceId/forms/:formId',
  authenticate,
  validate(listSubmissionsSchema),
  requirePermission(PERMISSIONS.SUBMISSION_VIEW),
  asyncHandler(submissionController.list),
);

router.get(
  '/workspace/:workspaceId/forms/:formId/:submissionId',
  authenticate,
  validate(submissionParamsSchema),
  requirePermission(PERMISSIONS.SUBMISSION_VIEW),
  asyncHandler(submissionController.getById),
);

router.delete(
  '/workspace/:workspaceId/forms/:formId/:submissionId',
  authenticate,
  validate(submissionParamsSchema),
  requirePermission(PERMISSIONS.SUBMISSION_DELETE),
  asyncHandler(submissionController.delete),
);

export default router;
