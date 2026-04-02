export interface ApiResponse<T = null> {
  success: boolean;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  errorCode: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}
