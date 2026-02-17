import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: {
    ok: false,
    provider: 'unknown',
    error: {
      code: 'rate_limited',
      message: 'Too many requests, please try again later',
    },
    meta: {
      generatedAt: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
