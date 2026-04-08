import { Router, type RequestHandler } from 'express';
import { sendSuccess } from '../../utils/response';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';
import authRoutes from '../../modules/auth/auth.routes';
import userRoutes from '../../modules/users/user.routes';
import workspaceRoutes from '../../modules/workspaces/workspace.routes';
import formRoutes from '../../modules/forms/form.routes';
import submissionRoutes from '../../modules/submissions/submission.routes';
import billingRoutes from '../../modules/billing/billing.routes';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() }, 'Server is healthy');
});

router.use('/auth', authRateLimiter as unknown as RequestHandler, authRoutes);
router.use('/users', authenticate as RequestHandler, userRoutes);
router.use('/workspaces', authenticate as RequestHandler, workspaceRoutes);
router.use('/forms', formRoutes);
router.use('/submissions', submissionRoutes);
router.use('/billing', billingRoutes); // Auth applied per-route (webhook must be unauthenticated)

export default router;
