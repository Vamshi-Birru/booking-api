import { createBookingWithInventoryAndIdempotency, cancelBooking as cancelBookingService } from "../services/bookingService.js";
import {
  findBookingsByUserId,
  markExpiredBookings,
  findBookingById,
} from "../repository/bookingRepository.js";

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    await markExpiredBookings();
    const bookings = await findBookingsByUserId(userId);
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    const booking = await findBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed to cancel this booking" });
    }
    const updated = await cancelBookingService(booking);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomTypeId, checkIn, checkOut } = req.body;
      // validation middleware already ensures required parameters

    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }
    
    const { statusCode, body } =
      await createBookingWithInventoryAndIdempotency({
        userId,
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
        idempotency: req.idempotency,
      });

    res.status(statusCode).json(body);
  } catch (err) {
    next(err);
  }
};