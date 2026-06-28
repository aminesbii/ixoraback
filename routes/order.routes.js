import { Router } from "express";
import { verifyToken, requireAdmin, requireAdminOrManager, requirePermission } from "../middlewares/auth.middleware.js";
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

// Admin / Manager — get earnings stats (cached 5 min)
router.get("/earnings-stats", verifyToken, requireAdminOrManager, requirePermission("orders"), limitReadsOnly, cacheMiddleware(300), ctrl.getEarningsStats);

// Admin / Manager — get order status stats (cached 5 min)
router.get("/status-stats", verifyToken, requireAdminOrManager, requirePermission("orders"), limitReadsOnly, cacheMiddleware(300), ctrl.getOrderStatusStats);

// Get specific order (authenticated, ownership check inside controller)
router.get("/:id", verifyToken, limitReadsOnly, ctrl.getById);

// Admin / Manager — list all orders
router.get("/", verifyToken, requireAdminOrManager, requirePermission("orders"), limitReadsOnly, ctrl.listAll);

// Admin / Manager — update order status
router.patch("/:id/status", verifyToken, requireAdminOrManager, requirePermission("orders"), limitWritesOnly, ctrl.updateStatus);

// Admin / Manager — update order details
router.put("/:id", verifyToken, requireAdminOrManager, requirePermission("orders"), limitWritesOnly, ctrl.update);

// Admin only — delete order
router.delete("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.remove);

export default router;
