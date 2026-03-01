import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info(
      {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      },
      "http request completed"
    );
  });

  next();
};