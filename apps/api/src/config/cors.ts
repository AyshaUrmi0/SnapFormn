import type { CorsOptions } from 'cors';
import { env } from './env';

export const corsConfig: CorsOptions = {
  origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
