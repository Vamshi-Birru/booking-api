/**
 * Full seed: admin user, room types for all hotels, and inventory.
 * Run: node scripts/seed-all.js
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import RoomType from "../models/RoomType.js";
import Inventory from "../models/Inventory.js";

dotenv.config();
mongoose.set("strictQuery", true);

const ADMIN_USERNAME = "Vamshi";
const ADMIN_PASSWORD = "HelloWorld.";

async function seedAdmin() {
  const existing = await User.findOne({ username: ADMIN_USERNAME });
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  if (existing) {
    existing.password = hash;
    existing.isAdmin = true;
    await existing.save();
    console.log("Updated admin user:", ADMIN_USERNAME);
  } else {
    await User.create({
      username: ADMIN_USERNAME,
      email: "vamshi@admin.com",
      country: "India",
      city: "Hyderabad",
      phone: "9999999999",
      password: hash,
      isAdmin: true,
    });
    console.log("Created admin user:", ADMIN_USERNAME);
  }
}

async function seedRoomTypes() {
  const hotels = await Hotel.find();
  let created = 0;
  for (const hotel of hotels) {
    const count = await RoomType.countDocuments({ hotelId: hotel._id });
    if (count > 0) continue;
    const price = hotel.cheapestPrice || 2000;
    await RoomType.create([
      { hotelId: hotel._id, type: "STANDARD", price: Math.floor(price * 0.9), totalRooms: 5 },
      { hotelId: hotel._id, type: "DELUXE", price, totalRooms: 3 },
    ]);
    created += 2;
  }
  console.log("Room types created for hotels:", created);
}

async function seedInventory() {
  const roomTypes = await RoomType.find();
  if (!roomTypes.length) {
    console.log("No room types to seed inventory.");
    return;
  }
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 120);

  const bulkOps = [];
  for (const rt of roomTypes) {
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      bulkOps.push({
        updateOne: {
          filter: { hotelId: rt.hotelId, roomTypeId: rt._id, date: dateStr },
          update: {
            $set: {
              hotelId: rt.hotelId,
              roomTypeId: rt._id,
              date: dateStr,
              availableRooms: rt.totalRooms,
            },
          },
          upsert: true,
        },
      });
    }
  }
  if (bulkOps.length) {
    await Inventory.bulkWrite(bulkOps);
    console.log("Inventory records created/updated:", bulkOps.length);
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB\n");

    await seedAdmin();
    await seedRoomTypes();
    await seedInventory();

    console.log("\nSeed completed.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
