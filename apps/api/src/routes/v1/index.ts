import { Router, type RequestHandler } from 'express';
import { sendSuccess } from '../../utils/response';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { detectCountryFromIp } from '../../modules/submissions/detect-country';
import authRoutes from '../../modules/auth/auth.routes';
import userRoutes from '../../modules/users/user.routes';
import workspaceRoutes from '../../modules/workspaces/workspace.routes';
import formRoutes from '../../modules/forms/form.routes';
import submissionRoutes from '../../modules/submissions/submission.routes';
import billingRoutes from '../../modules/billing/billing.routes';
import uploadRoutes from '../../modules/uploads/upload.routes';

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

/**
 * @swagger
 * /geo/country:
 *   get:
 *     summary: Resolve the caller's country from their IP
 *     description: |
 *       Used by the form editor to show creators their auto-detected country
 *       as a preview of what the Respondent's Country field will capture.
 *       Returns null if the IP can't be resolved (e.g. localhost, VPN, etc.).
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Resolved country (may be null)
 */
router.get(
  '/geo/country',
  asyncHandler(async (req, res) => {
    const xff = req.headers['x-forwarded-for'];
    let ip: string | undefined;
    if (typeof xff === 'string' && xff.length > 0) {
      ip = xff.split(',')[0]?.trim();
    }
    if (!ip) ip = req.ip || req.socket.remoteAddress || undefined;
    const country = await detectCountryFromIp(ip);
    sendSuccess(res, { country });
  }),
);

router.use('/auth', authRateLimiter as unknown as RequestHandler, authRoutes);
router.use('/users', authenticate as RequestHandler, userRoutes);
router.use('/workspaces', authenticate as RequestHandler, workspaceRoutes);
router.use('/forms', formRoutes);
router.use('/submissions', submissionRoutes);
router.use('/billing', billingRoutes); // Auth applied per-route (webhook must be unauthenticated)
router.use('/uploads', uploadRoutes); // Auth applied per-route (public sign endpoint is unauthenticated)

export default router;
