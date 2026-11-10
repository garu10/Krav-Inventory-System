import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production');
    }
    return 'krav_dev_jwt_secret_change_me_in_production_12345';
  }
  return secret;
};

/**
 * Sign a JWT token for an authenticated user session.
 */
export function signToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

/**
 * Verify and decode an incoming JWT token.
 */
export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

