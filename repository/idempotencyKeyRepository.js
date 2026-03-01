import IdempotencyKey from "../models/IdempotencyKey.js";

export const findIdempotencyKey = async ({ key, userId }) => {
  const query = { key };
  if (userId) query.userId = userId;
  return IdempotencyKey.findOne(query);
};

export const saveIdempotencyKey = async ({
  key,
  userId,
  bookingId,
  responseSnapshot,
}) => {
  const doc = await IdempotencyKey.findOneAndUpdate(
    { key, userId },
    {
      key,
      userId,
      bookingId,
      responseSnapshot,
    },
    { new: true, upsert: true }
  );
  return doc;
};