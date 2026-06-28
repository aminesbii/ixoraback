import { Router } from "express";
import { verifyToken, requireAdmin, requireAdminOrManager, requirePermission } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import * as ctrl from "../controllers/analytics.controller.js";

const router = Router();

// Public — track product events (view, click, add_to_cart, purchase)
router.post("/events", optionalAuth, limitWritesOnly, ctrl.trackEvent);

// Public — home page analytics overview (cached 5 min)
router.get("/public-analytics", optionalAuth, limitReadsOnly, cacheMiddleware(300), ctrl.getPublicAnalytics);

// Admin / Manager — daily performance data (cached 2 min)
router.get("/performance/daily", verifyToken, requireAdminOrManager, requirePermission("analytics"), limitReadsOnly, cacheMiddleware(120), ctrl.dailyPerformance);

// Admin / Manager — trigger aggregation for a specific date
router.post("/performance/aggregate", verifyToken, requireAdminOrManager, requirePermission("analytics"), limitWritesOnly, ctrl.triggerAggregation);

// Admin / Manager — top products dashboard (cached 5 min)
router.get("/performance/top", verifyToken, requireAdminOrManager, requirePermission("analytics"), limitReadsOnly, cacheMiddleware(300), ctrl.topProducts);

// Admin / Manager — daily product clicks (cached 2 min)
router.get("/performance/daily-clicks", verifyToken, requireAdminOrManager, requirePermission("analytics"), limitReadsOnly, cacheMiddleware(120), ctrl.dailyProductClicks);

export default router;
