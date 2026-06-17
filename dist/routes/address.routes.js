import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import * as ctrl from "../controllers/address.controller.js";
const router = Router();
// All address routes require authentication
router.use(verifyToken);
router.get("/", limitReadsOnly, ctrl.myAddresses);
router.get("/:id", limitReadsOnly, ctrl.getById);
router.post("/", limitWritesOnly, ctrl.create);
router.put("/:id", limitWritesOnly, ctrl.update);
router.delete("/:id", ctrl.remove);
export default router;
