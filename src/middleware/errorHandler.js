import { logger } from '../lib/logger.js';

export function errorHandler(err, _req, res, _next) {
  logger.error({ err }, 'request failed');
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    code: err.code || 'INTERNAL_ERROR',
    error: err.message || 'Internal server error'
  });
}
