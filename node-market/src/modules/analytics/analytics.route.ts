import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

// Get all analytics data
router.get("/", AnalyticsController.getAnalytics);

// Get overview stats only
router.get("/stats", AnalyticsController.getOverviewStats);

export default router;
