import { Router } from "express";
import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.js";
import { limitReadsOnly, limitWritesOnly } from "../middlewares/rateLimits.js";
import upload from "../middlewares/upload.middleware.js";
import { processSingleImage } from "../middlewares/imageProcessor.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";
import * as ctrl from "../controllers/product.controller.js";

const router = Router();

// ─── Products ───────────────────────────────────────────────────────────────
// Public (cached for 60s)
router.get("/", limitReadsOnly, cacheMiddleware(60), ctrl.list);
router.get("/slug/:slug", limitReadsOnly, cacheMiddleware(120), ctrl.getBySlug);
router.get("/:id", limitReadsOnly, cacheMiddleware(120), ctrl.getById);

// Admin
router.post("/", verifyToken, requireAdmin, limitWritesOnly, ctrl.create);
router.put("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.update);
router.delete("/:id", verifyToken, requireAdmin, limitWritesOnly, ctrl.remove);

// ─── Product Images ─────────────────────────────────────────────────────────
router.get("/:productId/images", limitReadsOnly, cacheMiddleware(300), ctrl.listImages);

router.post(
  "/:productId/images",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  processSingleImage(),
  ctrl.addImage
);

router.put(
  "/:productId/images/:imageId",
  verifyToken,
  requireAdmin,
  ctrl.updateImage
);

router.delete(
  "/:productId/images/:imageId",
  verifyToken,
  requireAdmin,
  ctrl.deleteImage
);

router.patch(
  "/:productId/images/:imageId/main",
  verifyToken,
  requireAdmin,
  ctrl.setMainImage
);

router.post(
  "/:productId/images/featured1",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  processSingleImage(),
  ctrl.addFeatured1Image
);

router.post(
  "/:productId/images/featured2",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  processSingleImage(),
  ctrl.addFeatured2Image
);

// ─── Product Variants ───────────────────────────────────────────────────────
router.get("/:productId/variants", limitReadsOnly, cacheMiddleware(300), ctrl.listVariants);

router.post(
  "/:productId/variants",
  verifyToken,
  requireAdmin,
  limitWritesOnly,
  ctrl.addVariant
);

router.put(
  "/:productId/variants/:variantId",
  verifyToken,
  requireAdmin,
  limitWritesOnly,
  ctrl.updateVariant
);

router.delete(
  "/:productId/variants/:variantId",
  verifyToken,
  requireAdmin,
  limitWritesOnly,
  ctrl.deleteVariant
);

router.patch(
  "/:productId/variants/:variantId/stock",
  verifyToken,
  requireAdmin,
  ctrl.adjustStock
);

export default router;
