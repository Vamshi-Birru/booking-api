import { findHotelsByCityPaginated } from "../repository/hotelRepository.js";
import { findRoomTypesByHotelIds } from "../repository/roomTypeRepository.js";
import { findInventoryForRoomTypeAndDates } from "../repository/inventoryRepository.js";
import { getDateRangeStrings } from "./dateUtils.js";

export const searchHotelsWithAvailability = async ({
  city,
  checkIn,
  checkOut,
  guests,
  page,
  limit,
}) => {
  // try cache first
  const { default: redis } = await import("../utils/redis.js");
  const cacheKey = `search:${city}:${checkIn}:${checkOut}:${page}:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {
      // fall through to fresh query if parse fails
    }
  }
  // 1) Fetch hotels in city with pagination
  const { hotels, total } = await findHotelsByCityPaginated({
    city,
    page,
    limit,
  });

  if (!hotels.length) {
    return {
      hotels: [],
      pagination: {
        page,
        limit,
        total,
        hasNextPage: false,
      },
    };
  }

  const hotelIds = hotels.map((h) => h._id);
  const roomTypes = await findRoomTypesByHotelIds(hotelIds);
  const dateStrings = getDateRangeStrings(checkIn, checkOut);
  const nights = dateStrings.length;

  // 2) For each room type, calculate min available across date range
  const roomTypesByHotel = {};
  for (const rt of roomTypes) {
    const key = rt.hotelId.toString();
    if (!roomTypesByHotel[key]) roomTypesByHotel[key] = [];
    roomTypesByHotel[key].push(rt);
  }

  const resultHotels = [];

  for (const hotel of hotels) {
    const hotelKey = hotel._id.toString();
    const hotelRoomTypes = roomTypesByHotel[hotelKey] || [];
    const enrichedRoomTypes = [];
    
    for (const rt of hotelRoomTypes) {
      const invDocs = await findInventoryForRoomTypeAndDates({
        hotelId: hotel._id,
        roomTypeId: rt._id,
        dates: dateStrings,
      });

      if (invDocs.length !== nights) {
        // incomplete inventory – treat as unavailable
        continue;
      }

      const minAvailable = Math.min(
        ...invDocs.map((d) => d.availableRooms)
      );

      if (minAvailable <= 0) continue;

      // Note: "guests" handling can be extended via capacity per room type.
      enrichedRoomTypes.push({
        id: rt._id,
        type: rt.type,
        price: rt.price,
        availableRooms: minAvailable,
      });
    }

    if (!enrichedRoomTypes.length) {
      continue;
    }

    resultHotels.push({
      id: hotel._id,
      name: hotel.name,
      city: hotel.city,
      address: hotel.address,
      rating: hotel.rating,
      roomTypes: enrichedRoomTypes,
    });
  }

  const result = {
    hotels: resultHotels,
    pagination: {
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
    },
  };

  // store in cache for 5 minutes, but do not block response
  redis.set(cacheKey, JSON.stringify(result), "EX", 300).catch(() => {});

  return result;
};