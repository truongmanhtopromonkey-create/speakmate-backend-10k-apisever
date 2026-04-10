import rateLimit from 'express-rate-limit';

export const burstLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, code: 'RATE_LIMIT', error: 'Too many requests. Please slow down.' }
});
