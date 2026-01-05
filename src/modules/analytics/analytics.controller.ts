import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { auth } from "../../auth";
import { fromNodeHeaders } from "better-auth/node";

export const AnalyticsController = {
  // Get all analytics data
  async getAnalytics(req: Request, res: Response) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session || session.user.role !== "ADMIN") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const analytics = await AnalyticsService.getAllAnalytics();
      
      res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  },

  // Get overview stats only
  async getOverviewStats(req: Request, res: Response) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session || session.user.role !== "ADMIN") {
        return res.status(403).json({ success: false, message: "Admin access required" });
      }

      const stats = await AnalyticsService.getOverviewStats();
      
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  },
};
