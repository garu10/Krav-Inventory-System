import { ValidationError } from '../errors/AppError.js';

/**
 * Request validation middleware using Joi schemas.
 * Validates req.body, req.query, or req.params.
 *
 * @param {import('joi').ObjectSchema} schema
 * @param {'body' | 'query' | 'params'} property
 */
export function validateRequest(schema, property = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return next(new ValidationError('Input validation failed', details));
    }

    req[property] = value;
    next();
  };
}

