import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from api root first, then monorepo root as fallback
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),

  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),

  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PRICE_PRO_MONTHLY: z.string().default(''),
  STRIPE_PRICE_PRO_YEARLY: z.string().default(''),
  STRIPE_PRICE_BUSINESS_MONTHLY: z.string().default(''),
  STRIPE_PRICE_BUSINESS_YEARLY: z.string().default(''),

  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('snapform'),

  RECAPTCHA_SECRET_KEY: z.string().default(''),

  FRONTEND_URL: z.string().default('http://localhost:3000'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
