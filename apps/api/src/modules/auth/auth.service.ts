import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AppError, ErrorCode } from '@snapform/shared';
import type { OtpPurpose } from '@prisma/client';
import { authRepository } from './auth.repository';
import { otpService } from './otp.service';
import { generateAccessToken } from '../../utils/token';
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const authService = {
  async register(email: string, name?: string) {
    const existing = await authRepository.findUserByEmail(email);
    if (existing) throw AppError.conflict('Email already registered');

    const user = await authRepository.createUser({ email, name });

    // Send verification OTP
    const code = await otpService.generate(user.id, 'EMAIL_VERIFICATION');
    await otpService.sendViaEmail(user.email, code, 'EMAIL_VERIFICATION');

    return { userId: user.id, email: user.email };
  },

  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Invalid credentials');

    if (!user.emailVerified) {
      throw new AppError(403, ErrorCode.FORBIDDEN, 'Please verify your email before logging in');
    }

    return this.issueTokenPair(user.id);
  },

  async verifyOtp(email: string, code: string, purpose: OtpPurpose) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw AppError.notFound('User not found');

    const valid = await otpService.verify(user.id, code, purpose);
    if (!valid) throw new AppError(400, ErrorCode.OTP_INVALID, 'Invalid or expired OTP');

    if (purpose === 'EMAIL_VERIFICATION') {
      await authRepository.updateUser(user.id, { emailVerified: true });
      return { verified: true };
    }

    if (purpose === 'LOGIN') {
      // Mark email as verified since they proved ownership via OTP
      if (!user.emailVerified) {
        await authRepository.updateUser(user.id, { emailVerified: true });
      }

      // Check if profile is complete (has name and password)
      const profileComplete = !!(user.name && user.passwordHash);

      if (profileComplete) {
        const tokens = await this.issueTokenPair(user.id);
        return { ...tokens, profileComplete: true };
      }

      // Issue a short-lived token for profile completion
      const accessToken = generateAccessToken({ sub: user.id });
      return { accessToken, profileComplete: false };
    }

    // For PASSWORD_RESET, return a short-lived token the client uses to call reset endpoint
    const resetToken = generateAccessToken({ sub: user.id });
    return { resetToken };
  },

  async requestOtp(email: string, purpose: OtpPurpose) {
    let user = await authRepository.findUserByEmail(email);

    // For LOGIN purpose, auto-create user if they don't exist
    if (!user && purpose === 'LOGIN') {
      user = await authRepository.createUser({ email });
    }

    if (!user) throw AppError.notFound('User not found');

    const code = await otpService.generate(user.id, purpose);
    await otpService.sendViaEmail(user.email, code, purpose);

    return { sent: true };
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

    // Reuse detection: if revoked, revoke entire family
    if (stored.revoked) {
      await authRepository.revokeTokenFamily(stored.family);
      throw new AppError(401, ErrorCode.TOKEN_INVALID, 'Token reuse detected. All sessions revoked.');
    }

    if (stored.expiresAt < new Date()) {
      throw new AppError(401, ErrorCode.TOKEN_EXPIRED, 'Refresh token expired');
    }

    // Rotate: revoke old, issue new in same family
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
    // Verify the Google access token via userinfo endpoint
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
