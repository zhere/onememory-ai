import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Development error response
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: 'error',
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Production error response
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handle database constraint errors
 */
const handleDBConstraintError = (err: any): AppError => {
  if (err.code === '23505') {
    // Unique constraint violation
    const field = err.detail?.match(/Key \((.+?)\)=/)?.[1] || 'field';
    return new AppError(`Duplicate value for ${field}`, 409, 'DUPLICATE_VALUE');
  }
  
  if (err.code === '23503') {
    // Foreign key constraint violation
    return new AppError('Referenced resource does not exist', 400, 'INVALID_REFERENCE');
  }
  
  if (err.code === '23502') {
    // Not null constraint violation
    const field = err.column || 'field';
    return new AppError(`${field} is required`, 400, 'MISSING_REQUIRED_FIELD');
  }
  
  return new AppError('Database constraint violation', 400, 'DB_CONSTRAINT_ERROR');
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');
};

/**
 * Handle validation errors
 */
const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors || {}).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Handle cast errors (invalid IDs, etc.)
 */
const handleCastError = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

/**
 * Handle rate limit errors
 */
const handleRateLimitError = (): AppError => {
  return new AppError('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
};

/**
 * Handle file upload errors
 */
const handleFileUploadError = (err: any): AppError => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 413, 'FILE_TOO_LARGE');
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files', 413, 'TOO_MANY_FILES');
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }
  
  return new AppError('File upload error', 400, 'FILE_UPLOAD_ERROR');
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.code?.startsWith('23')) {
      error = handleDBConstraintError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    } else if (err.name === 'CastError') {
      error = handleCastError(err);
    } else if (err.type === 'entity.too.large') {
      error = new AppError('Request entity too large', 413, 'PAYLOAD_TOO_LARGE');
    } else if (err.code === 'ECONNREFUSED') {
      error = new AppError('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE');
    } else if (err.code === 'ENOTFOUND') {
      error = new AppError('External service not found', 502, 'EXTERNAL_SERVICE_ERROR');
    } else if (err.code === 'ETIMEDOUT') {
      error = new AppError('Request timeout', 408, 'REQUEST_TIMEOUT');
    } else if (err.type === 'rate-limit') {
      error = handleRateLimitError();
    } else if (err.code?.startsWith('LIMIT_')) {
      error = handleFileUploadError(err);
    }

    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'ROUTE_NOT_FOUND');
  next(err);
};

/**
 * Validation error helper
 */
export const createValidationError = (field: string, message: string): AppError => {
  return new AppError(`Validation error: ${field} - ${message}`, 400, 'VALIDATION_ERROR');
};

/**
 * Authorization error helper
 */
export const createAuthError = (message: string = 'Not authorized'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Forbidden error helper
 */
export const createForbiddenError = (message: string = 'Access forbidden'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

/**
 * Not found error helper
 */
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Conflict error helper
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

/**
 * Internal server error helper
 */
export const createInternalError = (message: string = 'Internal server error'): AppError => {
  return new AppError(message, 500, 'INTERNAL_ERROR');
};

/**
 * Bad request error helper
 */
export const createBadRequestError = (message: string): AppError => {
  return new AppError(message, 400, 'BAD_REQUEST');
};

/**
 * Service unavailable error helper
 */
export const createServiceUnavailableError = (message: string = 'Service temporarily unavailable'): AppError => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};

/**
 * Request timeout error helper
 */
export const createTimeoutError = (message: string = 'Request timeout'): AppError => {
  return new AppError(message, 408, 'REQUEST_TIMEOUT');
};

/**
 * Rate limit error helper
 */
export const createRateLimitError = (message: string = 'Rate limit exceeded'): AppError => {
  return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
};

/**
 * Middleware to log errors
 */
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Log error details
  console.error('Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      code: err.code,
    },
  });

  next(err);
};

/**
 * Middleware to handle uncaught exceptions in async functions
 */
export const handleAsyncErrors = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};