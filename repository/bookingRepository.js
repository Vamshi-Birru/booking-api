import Booking from "../models/Booking.js";

export const createBooking = async (bookingData) => {
  const booking = new Booking(bookingData);
  return booking.save();
};

export const findBookingsByUserId = async (userId) => {
  return Booking.find({ userId })
    .sort({ createdAt: -1 })
    .populate("hotelId", "name city address rating")
    .populate("roomTypeId", "type price")
    .lean();
};

export const markExpiredBookings = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const bookings = await Booking.find({
    status: { $in: ["PENDING", "CONFIRMED"] },
  }).select("_id checkOut").lean();
  let expired = 0;
  for (const b of bookings) {
    const dayAfterCheckOut = addDays(b.checkOut, 1);
    if (today > dayAfterCheckOut) {
      await Booking.updateOne({ _id: b._id }, { $set: { status: "EXPIRED" } });
      expired++;
    }
  }
  return expired;
};

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const findBookingById = async (bookingId) => {
  return Booking.findById(bookingId).lean();
};

export const updateBookingStatus = async (bookingId, status) => {
  return Booking.findByIdAndUpdate(
    bookingId,
    { $set: { status } },
    { new: true }
  )
    .populate("hotelId", "name city address rating")
    .populate("roomTypeId", "type price")
    .lean();
};