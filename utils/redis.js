import Redis from "ioredis";

// allow connection via a single URL (e.g. REDIS_URL=redis://user:pass@host:6379)
// or via host/port environment variables for local development/docker-compose.
let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  });
}

redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;
