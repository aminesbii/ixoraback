import { Router } from "express";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/cart.controller.js";
const router = Router();
// All cart routes use optionalAuth — works for both guests (x-session-token) and users (JWT)
router.get("/", optionalAuth, ctrl.getCart);
router.post("/items", optionalAuth, limitWritesOnly, ctrl.addItem);
router.put("/items/:itemId", optionalAuth, limitWritesOnly, ctrl.updateItem);
router.delete("/items/:itemId", optionalAuth, ctrl.removeItem);
router.delete("/", optionalAuth, ctrl.clear);
// Merge guest cart into user cart (requires auth)
router.post("/merge", verifyToken, ctrl.merge);
export default router;
