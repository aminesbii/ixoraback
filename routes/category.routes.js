import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/category.controller.js";

const router = Router();

// Public
router.get("/", limitReadsOnly, ctrl.list);
router.get("/tree", limitReadsOnly, ctrl.tree);
router.get("/slug/:slug", limitReadsOnly, ctrl.getBySlug);
router.get("/:id", limitReadsOnly, ctrl.getById);

// Admin
router.post("/", verifyToken, requireAdmin, limitWritesOnly, ctrl.create);
router.put("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.update);
router.delete("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.remove);

export default router;
