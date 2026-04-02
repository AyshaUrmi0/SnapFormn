import type { OtpPurpose } from '@prisma/client';
import { generateOtp } from '@snapform/shared';
import { authRepository } from './auth.repository';
import { env } from '../../config/env';
import { sendEmail } from '../../lib/email';

const OTP_SUBJECTS: Record<string, string> = {
  EMAIL_VERIFICATION: 'Verify your Snapform account',
  PASSWORD_RESET: 'Reset your Snapform password',
  LOGIN: 'Your Snapform login code',
};

export const otpService = {
  async generate(userId: string, purpose: OtpPurpose): Promise<string> {
    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await authRepository.createOtp({ userId, code, purpose, expiresAt });
    return code;
  },

  async verify(userId: string, code: string, purpose: OtpPurpose): Promise<boolean> {
    const otp = await authRepository.findValidOtp(userId, code, purpose);
    if (!otp) return false;

    await authRepository.markOtpUsed(otp.id);
    return true;
  },

  async sendViaEmail(email: string, code: string, purpose: OtpPurpose): Promise<void> {
    await sendEmail({
      to: email,
      subject: OTP_SUBJECTS[purpose] || 'Your Snapform verification code',
      text: `Your verification code is: ${code}\n\nIt expires in ${env.OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, please ignore this email.`,
    });
  },
};
