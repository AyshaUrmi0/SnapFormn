import type { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '@snapform/shared';
import type { JwtPayload } from '@snapform/shared';
import { verifyAccessToken } from '../utils/token';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed authorization header');
  }

  try {
    const token = header.slice(7);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw new AppError(401, ErrorCode.TOKEN_EXPIRED, 'Invalid or expired access token');
  }
}
