import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { registerSchema, loginSchema, verifyOtpSchema, requestOtpSchema } from './auth.schema';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already registered }
 */
router.post('/register', validate(registerSchema), asyncHandler(authController.register));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify an OTP code
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, purpose]
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string }
 *               purpose: { type: string, enum: [EMAIL_VERIFICATION, PASSWORD_RESET, LOGIN] }
 *     responses:
 *       200: { description: OTP verified }
 */
router.post('/verify-otp', validate(verifyOtpSchema), asyncHandler(authController.verifyOtp));

/**
 * @swagger
 * /auth/request-otp:
 *   post:
 *     summary: Request a new OTP
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, purpose]
 *             properties:
 *               email: { type: string, format: email }
 *               purpose: { type: string, enum: [EMAIL_VERIFICATION, PASSWORD_RESET, LOGIN] }
 *     responses:
 *       200: { description: OTP sent }
 */
router.post('/request-otp', validate(requestOtpSchema), asyncHandler(authController.requestOtp));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Token refreshed }
 */
router.post('/refresh', asyncHandler(authController.refresh));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', asyncHandler(authController.logout));

export default router;
