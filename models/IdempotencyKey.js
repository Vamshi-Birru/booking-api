import mongoose from "mongoose";

const ResponseSnapshotSchema = new mongoose.Schema(
  {
    statusCode: { type: Number, required: true },
    body: { type: Object, required: true },
  },
  { _id: false }
);

const IdempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
    responseSnapshot: {
      type: ResponseSnapshotSchema,
      required: false,
    },
  },
  { timestamps: true }
);

IdempotencyKeySchema.index({ key: 1, userId: 1 }, { unique: true });

export default mongoose.model("IdempotencyKey", IdempotencyKeySchema);