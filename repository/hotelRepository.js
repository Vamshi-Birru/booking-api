import Hotel from "../models/Hotel.js";

export const findHotelsByCityPaginated = async ({ city, page, limit }) => {
  const query = {};
  if (city) {
    query.city = city;
  }

  const skip = (page - 1) * limit;

  const [hotels, total] = await Promise.all([
    Hotel.find(query).skip(skip).limit(limit),
    Hotel.countDocuments(query),
  ]);

  return { hotels, total };
};