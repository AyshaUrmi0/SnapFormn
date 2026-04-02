import rateLimit from 'express-rate-limit';

export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many requests, please try again later',
    errorCode: 'RATE_LIMITED',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many authentication attempts, please try again later',
    errorCode: 'RATE_LIMITED',
  },
});
