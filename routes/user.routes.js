import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/user.controller.js";

const router = Router();

// Self — get & update own profile
router.get("/profile", verifyToken, limitReadsOnly, ctrl.getProfile);
router.put("/profile", verifyToken, limitWritesOnly, ctrl.updateProfile);

// Admin — user management
router.get("/", verifyToken, requireAdmin, limitReadsOnly, ctrl.list);
router.get("/:id", verifyToken, requireAdmin, limitReadsOnly, ctrl.getById);
router.put("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.update);
router.delete("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.remove);

export default router;
