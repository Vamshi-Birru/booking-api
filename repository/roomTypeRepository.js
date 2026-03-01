import RoomType from "../models/RoomType.js";

export const findRoomTypesByHotelIds = async (hotelIds) => {
  return RoomType.find({ hotelId: { $in: hotelIds } });
};

export const findRoomTypesByHotelId = async (hotelId) => {
  return RoomType.find({ hotelId });
};