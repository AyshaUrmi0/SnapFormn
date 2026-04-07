import { z } from 'zod';

const otpPurpose = z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN']);

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address.'),
    name: z.string().max(100, 'Name must be 100 characters or less.').optional().transform(v => v?.trim() || undefined),
    password: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password is too long.').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Please enter your password.'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address.'),
    code: z.string().length(6, 'Please enter the 6-digit code from your email.'),
    purpose: otpPurpose,
  }),
});

export const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address.'),
    purpose: otpPurpose,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, 'Reset link is invalid. Please request a new one.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters.').max(128, 'Password is too long.'),
  }),
});

export const requestEmailChangeSchema = z.object({
  body: z.object({
    newEmail: z.string().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Please enter your password to confirm this change.'),
  }),
});

export const verifyEmailChangeSchema = z.object({
  body: z.object({
    changeToken: z.string().min(1, 'Email change request is invalid. Please try again.'),
    code: z.string().length(6, 'Please enter the 6-digit code sent to your new email.'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Please enter your current password.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(128, 'Password is too long.'),
  }),
});

export const completeProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'Please enter your first name.').max(50, 'First name is too long.'),
    lastName: z.string().min(1, 'Please enter your last name.').max(50, 'Last name is too long.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
  }),
});
