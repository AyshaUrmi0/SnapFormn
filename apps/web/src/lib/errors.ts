export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorCode: string,
    public errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isValidation() {
    return this.errorCode === 'VALIDATION_ERROR';
  }

  get isConflict() {
    return this.status === 409;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  getFieldError(field: string): string | undefined {
    return this.errors?.find((e) => e.field === field)?.message;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) {
    return new ApiError(500, error.message, 'UNKNOWN');
  }
  return new ApiError(500, 'An unexpected error occurred', 'UNKNOWN');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isValidation && error.errors?.length) {
      return error.errors.map((e) => e.message).join('. ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
