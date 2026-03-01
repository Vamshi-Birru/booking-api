import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bookingRoutes from "./routes/booking.js";
import { requestLogger } from "./middlewares/loggerMiddleware.js";
import { httpLogger } from "./utils/logger.js";

const app = express();
dotenv.config();

mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});
const getAllowedDomains = async () => {
  // Fetch or read allowed domains from a database or configuration file
  return ['http://localhost:3000/', 'https://booking-client-9k3a.onrender.com/','http://localhost:3001','https://id-preview--a2465ada-684a-42ed-b7d6-20eb16e3c7d7.lovable.app/'];
};
//middlewares
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins
    callback(null, true);
  },
  credentials: true,
};
app.use(cors(corsOptions))
// structured http logging (pino) plus custom request id tracker
app.use(httpLogger);
app.use(requestLogger);
app.use(cookieParser())
app.use(express.json());
app.use(async (req, res, next) => {
  const allowedDomains = await getAllowedDomains();
  const origin = req.headers.origin;
  if (!origin || allowedDomains.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");
  }
  next();
 
});
app.get("/",(req,res)=>{
  res.send("Api is Running.....");
});

// health check for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/bookings", bookingRoutes);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  const payload = {
    success: false,
    status: errorStatus,
    message: errorMessage,
  };
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }
  return res.status(errorStatus).json(payload);
});

app.listen(8800, () => {
  connect();
  console.log("Connected to backend.");
});
