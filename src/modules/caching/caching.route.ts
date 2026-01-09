import { Router } from "express";
import { CachingController } from "./caching.controller";
import { isAdmin } from "../../middleware/auth-middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const cachingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

router.use(cachingLimiter);

// Admin routes
router.get("/settings", isAdmin, CachingController.getSettings);
router.put("/settings", isAdmin, CachingController.updateSettings);
router.get("/stats", isAdmin, CachingController.getStats);
router.delete("/clear-all", isAdmin, CachingController.clearAll);
router.delete("/clear-products", isAdmin, CachingController.clearProducts);
router.delete("/clear-categories", isAdmin, CachingController.clearCategories);
router.delete("/clear-analytics", isAdmin, CachingController.clearAnalytics);

export default router;
