import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
      index: true,
    },
    checkIn: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    checkOut: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"],
      default: "CONFIRMED",
    },
    bookingReference: {
      type: String, // human readable, generated from uuid
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);