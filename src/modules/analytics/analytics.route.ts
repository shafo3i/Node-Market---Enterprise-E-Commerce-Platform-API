import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { isAdmin } from "../../middleware/auth-middleware";

const router = Router();

// Get all analytics data
router.get("/", isAdmin, AnalyticsController.getAnalytics);

// Get overview stats only
router.get("/stats", isAdmin, AnalyticsController.getOverviewStats);

export default router;
    