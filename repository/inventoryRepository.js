import Inventory from "../models/Inventory.js";

export const findInventoryForRoomTypeAndDates = async ({
  hotelId,
  roomTypeId,
  dates,
}) => {
  return Inventory.find({
    hotelId,
    roomTypeId,
    date: { $in: dates },
  });
};
export const findInventoryForRoomTypes = async ({
  hotelId,
  roomTypeId,
}) => {
  return Inventory.find({
    hotelId,
    roomTypeId,
  });
};

export const decrementInventoryForDate = async ({
  hotelId,
  roomTypeId,
  date,
}) => {
  return Inventory.updateOne(
    {
      hotelId,
      roomTypeId,
      date,
      availableRooms: { $gt: 0 },
    },
    {
      $inc: { availableRooms: -1 },
    }
  );
};

export const incrementInventoryForDate = async ({
  hotelId,
  roomTypeId,
  date,
}) => {
  return Inventory.updateOne(
    {
      hotelId,
      roomTypeId,
      date,
    },
    {
      $inc: { availableRooms: 1 },
    }
  );
};
