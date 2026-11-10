import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication Middleware:
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches user session data to req.user.
 */
export function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required. Missing Bearer token.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token missing.');
    }

    const decoded = verifyToken(token);
    req.user = decoded; // Contains { user_id, email, role, area, full_name }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control (RBAC) Guard:
 * Restricts endpoint to specified roles (e.g. 'Owner/Admin', 'Manager/Purchaser').
 */
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before checking roles.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        )
      );
    }

    next();
  };
}

/**
 * Area Guard (Bar vs Kitchen vs All):
 * Restricts staff access to their assigned operational area.
 */
export function requireArea(...allowedAreas) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }

    // Owner/Admin and Manager/Purchaser have global access
    if (req.user.role === 'Owner/Admin' || req.user.role === 'Manager/Purchaser') {
      return next();
    }

    if (req.user.area !== 'All' && !allowedAreas.includes(req.user.area)) {
      return next(
        new ForbiddenError(
          `Access restricted to ${allowedAreas.join('/')} staff. Your assigned area is ${req.user.area}.`
        )
      );
    }

    next();
  };
}

