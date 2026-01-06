import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

export const AnalyticsController = {
  // Get all analytics data
  async getAnalytics(req: Request, res: Response) {
    try {

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
