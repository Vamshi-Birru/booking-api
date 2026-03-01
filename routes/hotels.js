import express from "express";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  getHotel,
  getHotelRooms,
  getHotels,
  updateHotel,
  searchHotels,
} from "../controllers/hotel.js";
import Hotel from "../models/Hotel.js";
import {verifyAdmin} from "../utils/verifyToken.js"
import { getLimiter } from "../middlewares/rateLimit.js";
const router = express.Router();

//CREATE
router.post("/", verifyAdmin, createHotel);
//UPDATE
router.put("/:id", verifyAdmin, updateHotel);
//DELETE
router.delete("/:id", verifyAdmin, deleteHotel);
//GET
router.get("/find/:id", getLimiter, getHotel);
//GET ALL
router.get("/", getLimiter, getHotels);
router.get("/countByCity", getLimiter, countByCity);
router.get("/countByType", getLimiter, countByType);
router.get("/room/:id", getLimiter, getHotelRooms);
router.get("/search", getLimiter, searchHotels);

export default router;
