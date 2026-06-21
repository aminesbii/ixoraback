import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/analytics.controller.js";
const router = Router();
// Public — track product events (view, click, add_to_cart, purchase)
router.post("/events", optionalAuth, limitWritesOnly, ctrl.trackEvent);
// Public — home page analytics overview
router.get("/public-analytics", optionalAuth, limitReadsOnly, ctrl.getPublicAnalytics);
// Admin — daily performance data
router.get("/performance/daily", verifyToken, requireAdmin, limitReadsOnly, ctrl.dailyPerformance);
// Admin — trigger aggregation for a specific date
router.post("/performance/aggregate", verifyToken, requireAdmin, limitWritesOnly, ctrl.triggerAggregation);
// Admin — top products dashboard
router.get("/performance/top", verifyToken, requireAdmin, limitReadsOnly, ctrl.topProducts);
// Admin — daily product clicks (from ProductPerformanceDaily)
router.get("/performance/daily-clicks", verifyToken, requireAdmin, limitReadsOnly, ctrl.dailyProductClicks);
export default router;
