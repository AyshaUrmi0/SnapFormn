import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    name: z.string().min(1).max(100).optional(),
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
    purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN']),
  }),
});

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN']),
  }),
});
