import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
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
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

InventorySchema.index({ hotelId: 1, roomTypeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Inventory", InventorySchema);