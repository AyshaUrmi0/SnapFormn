import { Router } from 'express';
import { submissionController } from './submission.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { PERMISSIONS } from '@snapform/shared';
import { submitFormSchema, listSubmissionsSchema, analyticsSchema, submissionParamsSchema } from './submission.schema';

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
 *       201:
 *         description: Submission received
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Submission' }
 *       400:
 *         description: Missing required fields or invalid field IDs
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       403:
 *         description: Form is closed by schedule, has hit its submission cap, or workspace plan limit reached
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       404:
 *         description: Form not found or not published
 */
router.post(
  '/:slug',
  validate(submitFormSchema),
  asyncHandler(submissionController.submit),
);

/**
 * @swagger
 * /submissions/workspace/{workspaceId}/forms/{formId}:
 *   get:
 *     summary: List submissions for a form
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of submissions
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         submissions:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Submission' }
 *                         meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get(
  '/workspace/:workspaceId/forms/:formId',
  authenticate,
  validate(listSubmissionsSchema),
  requirePermission(PERMISSIONS.SUBMISSION_VIEW),
  asyncHandler(submissionController.list),
);

/**
 * @swagger
 * /submissions/workspace/{workspaceId}/forms/{formId}/analytics:
 *   get:
 *     summary: Get submission analytics for a form
 *     description: Returns overview counts, a daily timeline, and per-field stats.
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: days
 *         schema: { type: integer, minimum: 1, maximum: 365, default: 30 }
 *     responses:
 *       200:
 *         description: Analytics payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalSubmissions: { type: integer }
 *                     completedSubmissions: { type: integer }
 *                     completionRate: { type: integer }
 *                     firstSubmissionAt: { type: string, format: date-time, nullable: true }
 *                     lastSubmissionAt: { type: string, format: date-time, nullable: true }
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string, format: date }
 *                       count: { type: integer }
 *                 fieldStats:
 *                   type: array
 *                   items: { type: object }
 */
router.get(
  '/workspace/:workspaceId/forms/:formId/analytics',
  authenticate,
  validate(analyticsSchema),
  requirePermission(PERMISSIONS.SUBMISSION_VIEW),
  asyncHandler(submissionController.analytics),
);

/**
 * @swagger
 * /submissions/workspace/{workspaceId}/forms/{formId}/{submissionId}:
 *   get:
 *     summary: Get a single submission
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submission details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Submission' }
 *   delete:
 *     summary: Delete a submission and any associated Cloudinary uploads
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Submission deleted }
 */
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
