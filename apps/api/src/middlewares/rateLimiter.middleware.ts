import rateLimit from 'express-rate-limit';

function createLimiter(max: number, message: string) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      data: null,
      message,
      errorCode: 'RATE_LIMITED',
    },
  });
}

export const rateLimiterMiddleware = createLimiter(
  1000,
  'Too many requests, please try again later',
);

export const authRateLimiter = createLimiter(
  50,
  'Too many authentication attempts, please try again later',
);
