import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().max(100, 'Name must be 100 characters or less').optional(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const verifyOtpSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

export const completeProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be 50 characters or less'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be 50 characters or less'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
