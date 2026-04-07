import { z } from 'zod';

const otpPurpose = z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN']);

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1).max(100).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6, 'OTP must be 6 digits'),
    purpose: otpPurpose,
  }),
});

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    purpose: otpPurpose,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
  }),
});

export const completeProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});
