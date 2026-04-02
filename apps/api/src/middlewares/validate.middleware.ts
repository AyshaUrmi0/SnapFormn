import type { Request, Response, NextFunction } from 'express';
import { ZodError, type AnyZodObject, type ZodTypeAny } from 'zod';
import { AppError, ErrorCode } from '@snapform/shared';

type ValidationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new AppError(400, ErrorCode.VALIDATION_ERROR, 'Validation failed', errors));
        return;
      }
      next(err);
    }
  };
}
