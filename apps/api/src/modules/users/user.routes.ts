import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { updateProfileSchema } from './user.schema';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200: { description: User profile }
 */
router.get('/me', asyncHandler(userController.getMe));

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               avatarUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: Profile updated }
 */
router.patch('/me', validate(updateProfileSchema), asyncHandler(userController.updateMe));

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     responses:
 *       204: { description: Account deleted }
 */
router.delete('/me', asyncHandler(userController.deleteMe));

export default router;
