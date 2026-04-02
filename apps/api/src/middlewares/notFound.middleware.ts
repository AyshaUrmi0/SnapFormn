import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@snapform/shared';

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
}
