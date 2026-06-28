import { Router } from "express";
import { authLimiter } from "../middlewares/rateLimits.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { register, login, forgotPassword, resetPassword, me } from "../controllers/auth.controller.js";

const router = Router();

// Public routes (rate-limited)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

// Protected route
router.get("/me", verifyToken, me);

export default router;
