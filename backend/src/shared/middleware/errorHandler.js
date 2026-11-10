import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError.js';

/**
 * Centralized Express Error Handling Middleware.
 * Catches all errors from async controllers, services, and routes.
 */
export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle PostgreSQL specific error codes
  if (err.code === '23505') {
    // Unique violation (e.g. duplicate email, client_uuid duplicate)
    statusCode = StatusCodes.CONFLICT;
    message = 'A record with this information already exists.';
    details = err.detail || null;
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid reference: related entity does not exist.';
    details = err.detail || null;
  } else if (err.code === '23514') {
    // Check constraint violation
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Record data violates business constraints.';
    details = err.detail || null;
  }

  // Handle JWT validation errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Your session has expired. Please log in again.';
  }

  // Log server errors for developer inspection
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  const responsePayload = {
    success: false,
    error: {
      message,
      statusCode,
      details,
    },
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development' && !(err instanceof AppError)) {
    responsePayload.error.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
}

