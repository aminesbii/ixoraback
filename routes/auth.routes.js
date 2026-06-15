import { Router } from "express";
import { authLimiter } from "../middlewares/rateLimits.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { register, login, me } from "../controllers/auth.controller.js";

const router = Router();

// Public routes (rate-limited)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Protected route
router.get("/me", verifyToken, me);

export default router;
