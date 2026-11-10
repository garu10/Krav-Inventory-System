import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter:
 * Allows up to 300 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      statusCode: 429,
    },
  },
});

/**
 * Strict Rate Limiter for Authentication & PIN endpoints:
 * Prevents brute-force PIN / password guessing (15 attempts per 15 minutes).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
      statusCode: 429,
    },
  },
});

