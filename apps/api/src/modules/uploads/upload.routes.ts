import { Router, type RequestHandler } from 'express';
import { uploadController } from './upload.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { signUploadSchema, signPublicUploadSchema } from './upload.schema';

const router = Router();

/**
 * @swagger
 * /uploads/sign:
 *   post:
 *     summary: Sign a Cloudinary upload for a form owner
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [formId, fieldId]
 *             properties:
 *               formId: { type: string }
 *               fieldId: { type: string }
 *               resourceType: { type: string, enum: [image, video, raw, auto] }
 *     responses:
 *       200: { description: Upload signed }
 */
router.post(
  '/sign',
  authenticate as RequestHandler,
  validate(signUploadSchema),
  asyncHandler(uploadController.signForOwner),
);

/**
 * @swagger
 * /uploads/sign-public:
 *   post:
 *     summary: Sign a Cloudinary upload for an anonymous respondent
 *     description: Only works for forms with status PUBLISHED
 *     tags: [Uploads]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slug, fieldId]
 *             properties:
 *               slug: { type: string }
 *               fieldId: { type: string }
 *               resourceType: { type: string, enum: [image, video, raw, auto] }
 *     responses:
 *       200: { description: Upload signed }
 */
router.post(
  '/sign-public',
  validate(signPublicUploadSchema),
  asyncHandler(uploadController.signForRespondent),
);

export default router;
