import { Router } from "express";
import { verifyToken, requireAdminOrManager, requirePermission } from "../middlewares/auth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import * as ctrl from "../controllers/category.controller.js";

const router = Router();

// Public (cached for 5 minutes — categories change infrequently)
router.get("/", limitReadsOnly, cacheMiddleware(300), ctrl.list);
router.get("/tree", limitReadsOnly, cacheMiddleware(300), ctrl.tree);
router.get("/slug/:slug", limitReadsOnly, cacheMiddleware(300), ctrl.getBySlug);
router.get("/:id", limitReadsOnly, cacheMiddleware(300), ctrl.getById);

// Admin
router.post("/", verifyToken, requireAdminOrManager, requirePermission("products"), limitWritesOnly, ctrl.create);
router.put("/:id", verifyToken, requireAdminOrManager, requirePermission("products"), limitWritesOnly, ctrl.update);
router.delete("/:id", verifyToken, requireAdminOrManager, requirePermission("products"), limitWritesOnly, ctrl.remove);

export default router;
