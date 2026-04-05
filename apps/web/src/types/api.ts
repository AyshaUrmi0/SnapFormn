export type { ApiResponse, PaginationMeta } from '@snapform/shared';

export interface PaginatedData<T> {
  items: T[];
  meta: import('@snapform/shared').PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
