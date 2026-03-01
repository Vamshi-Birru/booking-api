import { z } from "zod";

// schema definitions
export const bookingSchema = z.object({
  hotelId: z.string().nonempty(),
  roomTypeId: z.string().nonempty(),
  checkIn: z.string().nonempty(),
  checkOut: z.string().nonempty(),
});

// generic validator
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid request payload",
      errors: result.error.format(),
    });
  }
  // overwrite body with parsed values (typed)
  req.body = result.data;
  next();
};
