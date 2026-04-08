export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode = ErrorCode.VALIDATION_ERROR) {
    return new AppError(400, errorCode, message);
  }

  static unauthorized(message = 'Unauthorized', errorCode = ErrorCode.UNAUTHORIZED) {
    return new AppError(401, errorCode, message);
  }

  static forbidden(message = 'Forbidden', errorCode = ErrorCode.FORBIDDEN) {
    return new AppError(403, errorCode, message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, ErrorCode.NOT_FOUND, message);
  }

  static conflict(message: string) {
    return new AppError(409, ErrorCode.CONFLICT, message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(500, ErrorCode.INTERNAL_ERROR, message);
  }
}
