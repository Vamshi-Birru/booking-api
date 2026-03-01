import express from "express";
import { createBooking, getMyBookings, cancelBooking } from "../controllers/booking.js";
import { verifyToken } from "../utils/verifyToken.js";
import { bookingIdempotencyMiddleware } from "../middlewares/idempotency.js";
import { bookingLimiter, getLimiter } from "../middlewares/rateLimit.js";
import { validateBody, bookingSchema } from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getLimiter, verifyToken, getMyBookings);
router.post(
	"/",
	verifyToken,
	bookingLimiter,
	bookingIdempotencyMiddleware,
	validateBody(bookingSchema),
	createBooking
);
router.put("/:id/cancel", verifyToken, cancelBooking);

export default router;