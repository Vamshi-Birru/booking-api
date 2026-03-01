import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { findRoomTypesByHotelId } from "../repository/roomTypeRepository.js";
import { findInventoryForRoomTypeAndDates } from "../repository/inventoryRepository.js";
import { searchHotelsWithAvailability } from "../services/searchService.js";
import { createError } from "../utils/error.js";
import { getDateRangeStrings } from "../services/dateUtils.js";

export const createHotel = async (req, res, next) => {
  const hotels = req.body.hotels;

  for(var i=0;i<hotels.length;i++){
    const newHotel = new Hotel(hotels[i]);
    try {
        const savedHotel = await newHotel.save();
      } catch (err) {
        next(err);
      }
  }
  res.status(201).json(hotels);


};
export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};
export const getHotels = async (req, res, next) => {
  const { min, max, ...others } = req.query;
  try {
    //console.log(req.query.limit);
    //const hotels=await Hotel.find({});
    const hotels = await Hotel.find({
      ...others,
      cheapestPrice: { $gt: min | 1, $lt: max || 100000 },
    });
    res.status(200).json(hotels);
    //console.log(hotels);
  } catch (err) {
    next(err);
  }
};
export const countByCity = async (req, res, next) => {
  const cities = req.query.cities ? req.query.cities.split(",") : [];

  try {
    const list = await Promise.all(
      cities.map((city) => {
        return Hotel.countDocuments({ city: city });
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};
export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotelId = req.params.id;
    const { checkIn, checkOut } = req.query;

    const roomTypes = await findRoomTypesByHotelId(hotelId);
    if (!roomTypes.length) {
      return res.status(200).json([]);
    }

    const result = [];
    for (const rt of roomTypes) {
      const item = {
        _id: rt._id,
        type: rt.type,
        price: rt.price,
        totalRooms: rt.totalRooms,
      };
      if (checkIn && checkOut) {
        const dates = getDateRangeStrings(checkIn, checkOut);
        if (dates.length) {
          const invDocs = await findInventoryForRoomTypeAndDates({
            hotelId,
            roomTypeId: rt._id,
            dates,
          });
          if (invDocs.length === dates.length) {
            item.availableRooms = Math.min(...invDocs.map((d) => d.availableRooms));
          } else {
            item.availableRooms = 0;
          }
        }
      }
      result.push(item);
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const searchHotels = async (req, res, next) => {
  try {
    const {
      city,
      checkIn,
      checkOut,
      guests,
      page = 1,
      limit = 10,
    } = req.query;

    if (!checkIn || !checkOut) {
      return next(createError(400, "checkIn and checkOut are required"));
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return next(createError(400, "checkOut must be after checkIn"));
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const result = await searchHotelsWithAvailability({
      city,
      checkIn,
      checkOut,
      guests: guests ? parseInt(guests, 10) : undefined,
      page: pageNum,
      limit: limitNum,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};