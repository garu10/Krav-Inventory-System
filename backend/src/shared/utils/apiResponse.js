import { StatusCodes } from 'http-status-codes';

/**
 * Standard Success Response envelope for all REST API endpoints.
 */
export function sendSuccess(res, data = null, message = 'Success', statusCode = StatusCodes.OK) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standard Paginated Response envelope.
 */
export function sendPaginated(res, items = [], pagination = {}, message = 'Success') {
  return res.status(StatusCodes.OK).json({
    success: true,
    message,
    data: items,
    pagination: {
      total: pagination.total ?? items.length,
      limit: pagination.limit ?? items.length,
      page: pagination.page ?? 1,
      totalPages: pagination.totalPages ?? 1,
      hasNext: Boolean(pagination.hasNext),
      hasPrev: Boolean(pagination.hasPrev),
    },
  });
}

