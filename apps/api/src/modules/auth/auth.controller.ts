import type { Request, Response } from 'express';
import { AppError } from '@snapform/shared';
import { authService, REFRESH_TOKEN_EXPIRY_MS } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
  path: '/api/v1/auth',
};

export const authController = {
  async register(req: Request, res: Response) {
    const { email, name } = req.body;
    const result = await authService.register(email, name);
    sendCreated(res, result, 'Registration successful. Check your email for a verification code.');
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Login successful');
  },

  async verifyOtp(req: Request, res: Response) {
    const { email, code, purpose } = req.body;
    const result = await authService.verifyOtp(email, code, purpose);

    // If login OTP with complete profile, set refresh token cookie
    if ('refreshToken' in result) {
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      sendSuccess(
        res,
        { accessToken: result.accessToken, profileComplete: result.profileComplete },
        'OTP verified, logged in',
      );
      return;
    }

    sendSuccess(res, result, 'OTP verified');
  },

  async completeProfile(req: Request, res: Response) {
    const userId = req.user!.sub;
    const { firstName, lastName, password } = req.body;
    const tokens = await authService.completeProfile(userId, firstName, lastName, password);

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Profile completed successfully');
  },

  async requestOtp(req: Request, res: Response) {
    const { email, purpose } = req.body;
    const result = await authService.requestOtp(email, purpose);
    sendSuccess(res, result, 'OTP sent successfully');
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw AppError.unauthorized('No refresh token provided');

    const tokens = await authService.refresh(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  },

  async google(req: Request, res: Response) {
    const { accessToken } = req.body;
    if (!accessToken) throw AppError.badRequest('Google access token is required');

    const tokens = await authService.googleLogin(accessToken);

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Google login successful');
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    sendSuccess(res, null, 'Logged out successfully');
  },
};
