import { Redis } from "ioredis";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), "config/.env") });

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

console.log(`[Redis] Initializing client for URL: ${redisUrl}`);

const redisClient = new Redis(redisUrl, {
  retryStrategy(times: number) {
    if (times > 5) {
      console.warn("[Redis] Max reconnection attempts reached. Caching will be bypassed.");
      return null;
    }
    return Math.min(times * 1000, 3000);
  },
  connectTimeout: 3000,
  lazyConnect: true
});

// Listeners to prevent unhandled crashes
redisClient.on("error", (err) => {
  console.warn(`[Redis] Connection warning: ${err.message || err}`);
});

redisClient.on("connect", () => {
  console.log("[Redis] Client connecting...");
});

redisClient.on("ready", () => {
  console.log("[Redis] Client connected and ready for caching.");
});

redisClient.on("end", () => {
  console.log("[Redis] Connection closed.");
});

// Non-blocking connection function
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (err: any) {
    console.warn(`[Redis] Connection failed: ${err.message || err}. Cache will be bypassed.`);
  }
};

export default redisClient;
