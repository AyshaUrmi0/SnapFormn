import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@snapform/shared';

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/favicon.ico') return res.status(204).end();
  if (req.path === '/') return res.status(200).json({ status: 'ok' });

  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
}
