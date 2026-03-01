import { v4 as uuidv4 } from "uuid";
import {
  createBooking as createBookingRepo,
  updateBookingStatus,
} from "../repository/bookingRepository.js";
import {
  decrementInventoryForDate,
  incrementInventoryForDate,
} from "../repository/inventoryRepository.js";
import { saveIdempotencyKey } from "../repository/idempotencyKeyRepository.js";
import { getDateRangeStrings } from "./dateUtils.js";
import { createError } from "../utils/error.js";
import logger from "../utils/logger.js";

export const createBookingWithInventoryAndIdempotency = async ({
  userId,
  hotelId,
  roomTypeId,
  checkIn,
  checkOut,
  idempotency,
}) => {
  const dates = getDateRangeStrings(checkIn, checkOut);
  if (dates.length<0) {
    throw createError(400, "checkOut must be after checkIn");
  }

  // STEP 2: atomic inventory decrement (per day) with rollback
  const successfullyDecrementedDates = [];

  try {
    for (const date of dates) {
      const res = await decrementInventoryForDate({
        hotelId,
        roomTypeId,
        date,
      });

      if (!res.modifiedCount) {
        // rollback previous days
        for (const rollbackDate of successfullyDecrementedDates) {
          await incrementInventoryForDate({
            hotelId,
            roomTypeId,
            date: rollbackDate,
          });
        }

        logger.info(
          {
            hotelId,
            roomTypeId,
            checkIn,
            checkOut,
          },
          "booking failed – no inventory"
        );

        throw createError(409, "No available rooms for the selected dates");
      }

      successfullyDecrementedDates.push(date);
    }

    // STEP 3: create booking
    const bookingReference = uuidv4();
    const booking = await createBookingRepo({
      userId,
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      status: "CONFIRMED",
      bookingReference,
    });

    const responseBody = {
      success: true,
      booking,
    };
    const statusCode = 201;

    // STEP 4: store idempotency record (if provided)
    if (idempotency?.key) {
      await saveIdempotencyKey({
        key: idempotency.key,
        userId,
        bookingId: booking._id,
        responseSnapshot: {
          statusCode,
          body: responseBody,
        },
      });
    }

    logger.info(
      {
        bookingId: booking._id,
        bookingReference,
        userId,
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
      },
      "booking created successfully"
    );

    return { statusCode, body: responseBody };
  } catch (err) {
    throw err;
  }
};

export const cancelBooking = async (booking) => {
  if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
    throw createError(400, "Only CONFIRMED or PENDING bookings can be cancelled");
  }

  const dates = getDateRangeStrings(booking.checkIn, booking.checkOut);
  for (const date of dates) {
    await incrementInventoryForDate({
      hotelId: booking.hotelId,
      roomTypeId: booking.roomTypeId,
      date,
    });
  }

  const updated = await updateBookingStatus(booking._id, "CANCELLED");
  logger.info(
    { bookingId: booking._id, userId: booking.userId },
    "booking cancelled"
  );
  return updated;
};