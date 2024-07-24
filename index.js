import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
dotenv.config();

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
  return ['http://localhost:3000/', 'https://booking-client-9k3a.onrender.com/','http://localhost:3001'];
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
app.use(cookieParser())
app.use(express.json());
app.use(async (req, res, next) => {
  const allowedDomains = await getAllowedDomains();
  const origin = req.headers.origin;
  if (!origin || allowedDomains.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
 
});
app.get("/",(req,res)=>{
  res.send("Api is Running.....");
});
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(8800, () => {
  connect();
  console.log("Connected to backend.");
});
