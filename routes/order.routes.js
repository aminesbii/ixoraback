import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import * as ctrl from "../controllers/order.controller.js";

const router = Router();

// Checkout (works for guests and users)
router.post("/checkout", optionalAuth, limitWritesOnly, ctrl.checkout);

// Public order tracking by order number
router.get("/track/:orderNumber", limitReadsOnly, ctrl.trackByNumber);

// Authenticated user — my orders
router.get("/mine", verifyToken, limitReadsOnly, ctrl.myOrders);

// Admin — get earnings stats (cached 5 min)
router.get("/earnings-stats", verifyToken, requireAdmin, limitReadsOnly, cacheMiddleware(300), ctrl.getEarningsStats);

// Admin — get order status stats (cached 5 min)
router.get("/status-stats", verifyToken, requireAdmin, limitReadsOnly, cacheMiddleware(300), ctrl.getOrderStatusStats);

// Get specific order (authenticated, ownership check inside controller)
router.get("/:id", verifyToken, limitReadsOnly, ctrl.getById);

// Admin — list all orders
router.get("/", verifyToken, requireAdmin, limitReadsOnly, ctrl.listAll);

// Admin — update order status
router.patch("/:id/status", verifyToken, requireAdmin, limitWritesOnly, ctrl.updateStatus);

// Admin — update order details
router.put("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.update);

// Admin — delete order
router.delete("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.remove);

export default router;
