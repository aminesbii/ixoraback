import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import helmet from "helmet";

// Import Redis Client and connections
import redisClient, { connectRedis } from "./config/redis.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), "config/.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Logging Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom CORS Middleware based on ALLOWED_ORIGINS
app.use((req, res, next) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve Static Uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

/**
 * Cache Middleware using Redis
 * @param {number} durationInSeconds - Cache duration
 */
export const cacheMiddleware = (durationInSeconds = 60) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    // If Redis is not connected/ready, bypass cache gracefully
    if (!redisClient.isOpen || !redisClient.isReady) {
      return next();
    }

    const key = `express-cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");
        return res.send(cachedResponse);
      }

      res.setHeader("X-Cache", "MISS");

      // Intercept and store response in cache
      const originalSend = res.send;
      res.send = function (body) {
        if (res.statusCode === 200) {
          redisClient
            .setEx(
              key,
              durationInSeconds,
              typeof body === "string" ? body : JSON.stringify(body)
            )
            .catch((err) =>
              console.warn(`[Redis] Error setting key ${key}: ${err.message || err}`)
            );
        }
        return originalSend.call(this, body);
      };

      next();
    } catch (err) {
      console.warn(`[Redis] Cache error: ${err.message || err}`);
      next();
    }
  };
};

// Health Check API
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redisStatus = redisClient.isOpen && redisClient.isReady ? "connected" : "disconnected";

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: dbStatus,
      redis: redisStatus,
    },
  });
});

// Sample cached endpoint to demonstrate caching
app.get("/api/data", cacheMiddleware(30), async (req, res) => {
  // Simulate slow operation (e.g. complex db query or ML inference)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  res.json({
    message: "This response is cached for 30 seconds!",
    timestamp: new Date().toISOString(),
    randomValue: Math.random(),
  });
});

// Database Connections & Server Start
const startServer = async () => {
  // 1. Connect to MongoDB
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in env variables");
    }
    console.log("[MongoDB] Connecting...");
    await mongoose.connect(mongoUri);
    console.log("[MongoDB] Connected successfully.");
  } catch (err) {
    console.error("[MongoDB] Connection failure:", err.message || err);
    process.exit(1);
  }

  // 2. Connect to Redis (graceful connection)
  await connectRedis();

  // 3. Start Express app
  app.listen(PORT, () => {
    console.log(`[Server] Express server running at http://localhost:${PORT}`);
  });
};

startServer();
