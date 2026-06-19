import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import helmet from "helmet";
// Import Redis Client and connections
import redisClient, { connectRedis } from "./config/redis.js";
// Prisma
import prisma from "./config/prisma.js";
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
// Serve uploaded images via API endpoint (works through Angular /api proxy)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Re-usable handler for serving uploaded images
const serveUpload = (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }
    const ext = path.extname(filename).toLowerCase();
    const mime = ext === '.webp' ? 'image/webp' :
        ext === '.png' ? 'image/png' :
            ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                ext === '.gif' ? 'image/gif' :
                    ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
};
// Primary endpoint (works through Angular /api proxy)
app.get("/api/uploads/:filename", serveUpload);
// Legacy /uploads endpoint (direct Express access)
app.get("/uploads/:filename", serveUpload);
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
        if (redisClient.status !== "ready") {
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
                        .setex(key, durationInSeconds, typeof body === "string" ? body : JSON.stringify(body))
                        .catch((err) => console.warn(`[Redis] Error setting key ${key}: ${err.message || err}`));
                }
                return originalSend.call(this, body);
            };
            next();
        }
        catch (err) {
            console.warn(`[Redis] Cache error: ${err.message || err}`);
            next();
        }
    };
};
// Health Check API
app.get("/api/health", async (req, res) => {
    let dbStatus = "disconnected";
    try {
        await prisma.$queryRaw `SELECT 1`;
        dbStatus = "connected";
    }
    catch (e) {
        dbStatus = "error";
    }
    const redisStatus = redisClient.status === "ready" ? "connected" : "disconnected";
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
            postgreSQL: dbStatus,
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
    // 1. Check PostgreSQL via Prisma
    try {
        console.log("[PostgreSQL] Connecting...");
        await prisma.$connect();
        console.log("[PostgreSQL] Connected successfully.");
    }
    catch (err) {
        console.error("[PostgreSQL] Connection failure:", err.message || err);
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
