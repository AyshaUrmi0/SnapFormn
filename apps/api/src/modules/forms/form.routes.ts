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

/**
 * @swagger
 * /forms/{slug}:
 *   get:
 *     summary: Get a published form by its public slug
 *     description: Public endpoint used by respondents. Returns 404 unless the form is PUBLISHED.
 *     tags: [Forms]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Form data including fields
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Form' }
 *       404:
 *         description: Form not found or not published
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get(
  '/:slug',
  validate(z.object({ params: z.object({ slug: z.string().min(1) }) })),
  asyncHandler(formController.getPublicBySlug),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}:
 *   post:
 *     summary: Create a new form in a workspace
 *     description: |
 *       Creates a draft form. The slug is auto-generated from the title and
 *       auto-disambiguated if it collides (e.g. `contact-us`, `contact-us-2`).
 *       Subject to the workspace plan's form limit.
 *     tags: [Forms]
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
 *             required: [title]
 *             properties:
 *               title: { type: string, maxLength: 255 }
 *               description: { type: string, maxLength: 2000 }
 *               slug:
 *                 type: string
 *                 description: Optional override; lowercase alphanumeric with hyphens
 *     responses:
 *       201:
 *         description: Form created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Form' }
 *       403:
 *         description: Plan limit exceeded — workspace cannot create more forms
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post(
  '/workspace/:workspaceId',
  authenticate,
  validate(createFormSchema),
  requirePermission(PERMISSIONS.FORM_CREATE),
  asyncHandler(formController.create),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}:
 *   get:
 *     summary: List forms in a workspace
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED, CLOSED] }
 *     responses:
 *       200:
 *         description: Paginated list of forms
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
 *                         forms:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Form' }
 *                         meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get(
  '/workspace/:workspaceId',
  authenticate,
  validate(formListSchema),
  requirePermission(PERMISSIONS.FORM_VIEW),
  asyncHandler(formController.list),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}/trash:
 *   get:
 *     summary: List soft-deleted forms in a workspace
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Forms in trash }
 *   delete:
 *     summary: Permanently empty workspace trash
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Trash emptied }
 */
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

/**
 * @swagger
 * /forms/workspace/{workspaceId}/{formId}:
 *   get:
 *     summary: Get a form by ID (owner view, includes drafts)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Form details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Form' }
 *   patch:
 *     summary: Update form metadata or settings
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, maxLength: 255 }
 *               description: { type: string, maxLength: 2000 }
 *               settings:
 *                 type: object
 *                 description: |
 *                   Free-form JSON. Known top-level keys:
 *                   `successPage`, `share`, `embed`, `schedule`.
 *     responses:
 *       200: { description: Form updated }
 *   delete:
 *     summary: Soft-delete a form (moves to trash)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Form moved to trash }
 */
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

/**
 * @swagger
 * /forms/workspace/{workspaceId}/{formId}/status:
 *   patch:
 *     summary: Change form status (publish, draft, or close)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [DRAFT, PUBLISHED, CLOSED] }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch(
  '/workspace/:workspaceId/:formId/status',
  authenticate,
  validate(updateFormStatusSchema),
  requirePermission(PERMISSIONS.FORM_PUBLISH),
  asyncHandler(formController.updateStatus),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}/{formId}/fields:
 *   put:
 *     summary: Replace all fields on a form
 *     description: Atomically replaces the form's field list. Editor saves use this endpoint.
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
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
 *                 items: { $ref: '#/components/schemas/FormField' }
 *     responses:
 *       200: { description: Fields replaced }
 */
router.put(
  '/workspace/:workspaceId/:formId/fields',
  authenticate,
  validate(formFieldsSchema),
  requirePermission(PERMISSIONS.FORM_EDIT),
  asyncHandler(formController.replaceFields),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}/{formId}/duplicate:
 *   post:
 *     summary: Duplicate a form (including all fields)
 *     description: Counts toward the workspace plan's form limit.
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Duplicated form }
 *       403: { description: Plan form limit exceeded }
 */
router.post(
  '/workspace/:workspaceId/:formId/duplicate',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_CREATE),
  asyncHandler(formController.duplicate),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}/{formId}/restore:
 *   post:
 *     summary: Restore a soft-deleted form from trash
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Form restored }
 *       403: { description: Plan form limit exceeded }
 */
router.post(
  '/workspace/:workspaceId/:formId/restore',
  authenticate,
  validate(formParamsSchema),
  requirePermission(PERMISSIONS.FORM_DELETE),
  asyncHandler(formController.restore),
);

/**
 * @swagger
 * /forms/workspace/{workspaceId}/{formId}/permanent:
 *   delete:
 *     summary: Permanently delete a trashed form
 *     description: Form must already be in trash. Cannot be undone.
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: formId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Form deleted permanently }
 */
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
