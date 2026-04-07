import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { AppError, ErrorCode } from '@snapform/shared';
import type { OtpPurpose } from '@prisma/client';
import { authRepository } from './auth.repository';
import { otpService } from './otp.service';
import { generateAccessToken, verifyAccessToken } from '../../utils/token';
import { env } from '../../config/env';

export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export const authService = {
  async register(email: string, name?: string, password?: string) {
    const existing = await authRepository.findUserByEmail(email);
    if (existing) throw AppError.conflict('An account with this email already exists. Try signing in instead.');

    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
    const user = await authRepository.createUser({ email, name, emailVerified: true, ...(passwordHash && { passwordHash }) });

    return { userId: user.id, email: user.email };
  },

  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Incorrect email or password. Please try again.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Incorrect email or password. Please try again.');

    return this.issueTokenPair(user.id);
  },

  async verifyOtp(email: string, code: string, purpose: OtpPurpose) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw AppError.notFound('No account found with this email.');

    const valid = await otpService.verify(user.id, code, purpose);
    if (!valid) throw new AppError(400, ErrorCode.OTP_INVALID, 'The code you entered is incorrect or has expired. Please try again.');

    if (purpose === 'EMAIL_VERIFICATION') {
      await authRepository.updateUser(user.id, { emailVerified: true });
      return { verified: true };
    }

    if (purpose === 'LOGIN') {
      if (!user.emailVerified) {
        await authRepository.updateUser(user.id, { emailVerified: true });
      }

      const profileComplete = !!(user.name && (user.passwordHash || user.provider === 'GOOGLE'));

      if (profileComplete) {
        const tokens = await this.issueTokenPair(user.id);
        return { ...tokens, profileComplete: true };
      }

      const accessToken = generateAccessToken({ sub: user.id });
      return { accessToken, profileComplete: false };
    }

    const resetToken = generateAccessToken({ sub: user.id });
    return { resetToken };
  },

  async requestOtp(email: string, purpose: OtpPurpose) {
    let user = await authRepository.findUserByEmail(email);

    if (!user && purpose === 'LOGIN') {
      user = await authRepository.createUser({ email });
    }

    if (!user) throw AppError.notFound('No account found with this email.');

    const code = await otpService.generate(user.id, purpose);
    await otpService.sendViaEmail(user.email, code, purpose);

    return { sent: true };
  },

  async resetPassword(resetToken: string, newPassword: string) {
    let payload;
    try {
      payload = verifyAccessToken(resetToken);
    } catch {
      throw AppError.unauthorized('Your reset link has expired. Please request a new one.');
    }

    const user = await authRepository.findById(payload.sub);
    if (!user) throw AppError.notFound('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await authRepository.updateUser(user.id, { passwordHash });
    await authRepository.revokeUserTokens(user.id);

    return { success: true };
  },

  async requestEmailChange(userId: string, newEmail: string, password: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    if (!user.passwordHash) {
      throw AppError.badRequest('You don\'t have a password set yet. Please set one in your account settings first.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('The password you entered is incorrect.');

    const existing = await authRepository.findUserByEmail(newEmail);
    if (existing) throw AppError.conflict('This email is already being used by another account.');

    // Send OTP to the new email for verification
    const code = await otpService.generate(user.id, 'EMAIL_VERIFICATION');
    await otpService.sendViaEmail(newEmail, code, 'EMAIL_VERIFICATION');

    // Create a short-lived token encoding the new email
    const changeToken = jwt.sign(
      { sub: user.id, newEmail },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '10m' },
    );

    return { changeToken, sent: true };
  },

  async verifyEmailChange(changeToken: string, code: string) {
    let payload: { sub: string; newEmail: string };
    try {
      payload = jwt.verify(changeToken, env.JWT_ACCESS_SECRET) as { sub: string; newEmail: string };
    } catch {
      throw AppError.unauthorized('Your email change request has expired. Please try again.');
    }

    if (!payload.newEmail) {
      throw AppError.badRequest('Invalid change token');
    }

    const user = await authRepository.findById(payload.sub);
    if (!user) throw AppError.notFound('User not found');

    const validOtp = await otpService.verify(user.id, code, 'EMAIL_VERIFICATION');
    if (!validOtp) throw new AppError(400, ErrorCode.OTP_INVALID, 'The code you entered is incorrect or has expired. Please try again.');

    // Check again that new email isn't taken
    const existing = await authRepository.findUserByEmail(payload.newEmail);
    if (existing) throw AppError.conflict('This email is already being used by another account.');

    await authRepository.updateUser(user.id, { email: payload.newEmail });

    return { success: true, email: payload.newEmail };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    if (!user.passwordHash) {
      throw AppError.badRequest('You don\'t have a password yet. Use "Forgot password" on the login page to set one.');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw AppError.unauthorized('The current password you entered is incorrect.');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await authRepository.updateUser(user.id, { passwordHash });

    return { success: true };
  },

  async completeProfile(userId: string, firstName: string, lastName: string, password: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const name = `${firstName} ${lastName}`.trim();
    const passwordHash = await bcrypt.hash(password, 12);

    await authRepository.updateUser(user.id, { name, passwordHash });

    return this.issueTokenPair(user.id);
  },

  async refresh(refreshTokenValue: string) {
    const stored = await authRepository.findRefreshToken(refreshTokenValue);
    if (!stored) {
      throw new AppError(401, ErrorCode.TOKEN_INVALID, 'Invalid refresh token');
    }

    if (stored.revoked) {
      await authRepository.revokeTokenFamily(stored.family);
      throw new AppError(401, ErrorCode.TOKEN_INVALID, 'Token reuse detected. All sessions revoked.');
    }

    if (stored.expiresAt < new Date()) {
      throw new AppError(401, ErrorCode.TOKEN_EXPIRED, 'Refresh token expired');
    }

    await authRepository.revokeTokenFamily(stored.family);
    return this.issueTokenPair(stored.userId, stored.family);
  },

  async logout(refreshTokenValue: string) {
    const stored = await authRepository.findRefreshToken(refreshTokenValue);
    if (stored) {
      await authRepository.revokeTokenFamily(stored.family);
    }
  },

  async googleLogin(accessToken: string) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw AppError.unauthorized('Invalid Google token');
    }

    const profile = await res.json() as {
      email?: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };

    if (!profile.email) {
      throw AppError.unauthorized('Could not get email from Google');
    }

    const { email, name, picture, email_verified } = profile;

    let user = await authRepository.findUserByEmail(email);

    if (!user) {
      user = await authRepository.createUser({
        email,
        name: name || null,
        avatarUrl: picture || null,
        emailVerified: email_verified ?? true,
        provider: 'GOOGLE',
      });
    } else if (user.provider === 'EMAIL') {
      await authRepository.updateUser(user.id, {
        provider: 'GOOGLE',
        avatarUrl: user.avatarUrl || picture || null,
        emailVerified: true,
      });
    }

    return this.issueTokenPair(user.id);
  },

  async issueTokenPair(userId: string, family?: string) {
    const tokenFamily = family || randomBytes(16).toString('hex');
    const accessToken = generateAccessToken({ sub: userId });
    const refreshTokenValue = randomBytes(40).toString('hex');

    await authRepository.createRefreshToken({
      userId,
      token: refreshTokenValue,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return { accessToken, refreshToken: refreshTokenValue };
  },
};
