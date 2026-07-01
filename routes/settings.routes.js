import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/settings.controller.js";

const router = Router();

router.get("/available-pages", verifyToken, requireAdmin, limitReadsOnly, ctrl.getAvailablePages);
router.get("/managers", verifyToken, requireAdmin, limitReadsOnly, ctrl.listManagers);
router.get("/managers/:id", verifyToken, requireAdmin, limitReadsOnly, ctrl.getManager);
router.post("/managers", verifyToken, requireAdmin, limitWritesOnly, ctrl.createManager);
router.put("/managers/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.updateManager);
router.delete("/managers/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.deleteManager);

export default router;
