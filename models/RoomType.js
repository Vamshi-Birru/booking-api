import mongoose from "mongoose";

const RoomTypeSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    type: {
      type: String, // e.g. "DELUXE", "STANDARD"
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RoomType", RoomTypeSchema);