import { NotFoundError } from '../errors/AppError.js';

/**
 * 404 Handler for undefined API routes.
 */
export function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

