/**
 * Seed inventory for RoomTypes.
 * Run: node scripts/seed-inventory.js
 * Creates inventory records for each RoomType for the next 90 days.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import RoomType from "../models/RoomType.js";
import Inventory from "../models/Inventory.js";

dotenv.config();

mongoose.set("strictQuery", true);

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");

    const roomTypes = await RoomType.find();

    if (!roomTypes.length) {
      console.log("No RoomTypes found. Create hotels and room types first.");
      process.exit(0);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    let created = 0;
    for (const rt of roomTypes) {
      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        await Inventory.findOneAndUpdate(
          { hotelId: rt.hotelId, roomTypeId: rt._id, date: dateStr },
          {
            hotelId: rt.hotelId,
            roomTypeId: rt._id,
            date: dateStr,
            availableRooms: rt.totalRooms,
          },
          { upsert: true, new: true }
        );
        created++;
      }
    }

    console.log(`Created/updated ${created} inventory records`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedInventory();
