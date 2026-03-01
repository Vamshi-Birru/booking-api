import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // hotel, apartment, etc (kept from your existing schema)
    city: { type: String, required: true },
    address: { type: String, required: true },
    distance: { type: String, required: true },
    photos: { type: [String] },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 }, // used in search response
    rooms: { type: [String] }, // legacy relation to Room
    cheapestPrice: { type: Number, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true } // adds createdAt / updatedAt
);

export default mongoose.model("Hotel", HotelSchema);