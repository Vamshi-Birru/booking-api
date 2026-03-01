/**
 * Mark bookings as EXPIRED when today > checkOut + 1 day.
 * Run via cron: 0 0 * * * node /path/to/scripts/expire-bookings.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { markExpiredBookings } from "../repository/bookingRepository.js";

dotenv.config();
mongoose.set("strictQuery", true);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO);
    const count = await markExpiredBookings();
    console.log("Expired bookings marked:", count);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
