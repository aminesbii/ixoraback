import redisClient from "../config/redis.js";

export const cacheMiddleware = (durationInSeconds = 60) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

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

      const originalSend = res.send;
      res.send = function (body) {
        if (res.statusCode === 200) {
          redisClient
            .setex(
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
