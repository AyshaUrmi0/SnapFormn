import type { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@snapform/shared';
import type { ApiErrorResponse } from '@snapform/shared';
import { env } from '../config/env';
import { logger } from '../lib/logger';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, path: req.path, method: req.method }, err.message);

  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      data: null,
      message: err.message,
      errorCode: err.errorCode,
      errors: err.errors,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    };
    return res.status(err.statusCode).json(body);
  }

  // Unhandled error
  const body: ApiErrorResponse = {
    success: false,
    data: null,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    errorCode: ErrorCode.INTERNAL_ERROR,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  return res.status(500).json(body);
}
