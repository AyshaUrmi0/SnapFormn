import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '@snapform/shared';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created') {
  return sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Success',
) {
  const body: ApiResponse<T[]> = { success: true, data, message, meta };
  return res.status(200).json(body);
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
