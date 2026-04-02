import type { Request, Response } from 'express';
import { AppError } from '@snapform/shared';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth',
};

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body;
    const result = await authService.register(email, password, name);
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

    // If login OTP, set refresh token cookie
    if ('refreshToken' in result) {
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      sendSuccess(res, { accessToken: result.accessToken }, 'OTP verified, logged in');
      return;
    }

    sendSuccess(res, result, 'OTP verified');
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

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    sendSuccess(res, null, 'Logged out successfully');
  },
};
