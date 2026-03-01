import mongoose from "mongoose";
const HotelRoomSchema = new mongoose.Schema({
  hotelId: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  totalRooms: {
    type: int,
    required: true,
  }
});

export default mongoose.model("Hotel Room", HotelRoomSchema)
