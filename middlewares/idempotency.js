import { findIdempotencyKey } from "../repository/idempotencyKeyRepository.js";
import logger from "../utils/logger.js";

// Specifically for booking POST, uses Idempotency-Key header
export const bookingIdempotencyMiddleware = async (req, res, next) => {
  const key = req.header("Idempotency-Key");
  if (!key) {
    return next();
  }

  const userId = req.user?.id || null;

  try {
    const existing = await findIdempotencyKey({ key, userId });

    if (existing && existing.responseSnapshot) {
      logger.info(
        {
          key,
          userId,
          bookingId: existing.bookingId,
        },
        "idempotent booking – returning cached response"
      );

      return res
        .status(existing.responseSnapshot.statusCode)
        .json(existing.responseSnapshot.body);
    }

    // Make available to downstream service
    req.idempotency = { key, userId };
    next();
  } catch (err) {
    next(err);
  }
};