import rateLimit from "express-rate-limit";

// generic limiter factory
export const createRateLimiter = ({ windowMs, max, message, keyGenerator }) =>
  rateLimit({
    windowMs,
    max,
    message: message || "Too many requests, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator,
  });

// booking-specific limiter
export const bookingLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
});

// generic GET limiter (higher threshold, used for read endpoints)
// applying a rate limit on GET requests prevents scraping/DoS while
// still allowing reasonable traffic volumes. adjust as needed.
export const getLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
});
