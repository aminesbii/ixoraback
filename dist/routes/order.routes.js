import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/order.controller.js";
const router = Router();
// Checkout (works for guests and users)
router.post("/checkout", optionalAuth, limitWritesOnly, ctrl.checkout);
// Public order tracking by order number
router.get("/track/:orderNumber", limitReadsOnly, ctrl.trackByNumber);
// Authenticated user — my orders
router.get("/mine", verifyToken, limitReadsOnly, ctrl.myOrders);
// Get specific order (authenticated, ownership check inside controller)
router.get("/:id", verifyToken, limitReadsOnly, ctrl.getById);
// Admin — list all orders
router.get("/", verifyToken, requireAdmin, limitReadsOnly, ctrl.listAll);
// Admin — update order status
router.patch("/:id/status", verifyToken, requireAdmin, limitWritesOnly, ctrl.updateStatus);
export default router;
