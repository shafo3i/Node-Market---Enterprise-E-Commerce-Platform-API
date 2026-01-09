import { Request, Response } from "express";
import { CachingService } from "./caching.service";
import { updateCacheSettingsSchema } from "./caching.validation";

export const CachingController = {
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await CachingService.getSettings();
      return res.json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching cache settings:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      const session = res.locals.session;
      
      const validated = updateCacheSettingsSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const settings = await CachingService.updateSettings(
        validated.data,
        session.user.id
      );

      return res.json({
        success: true,
        message: "Cache settings updated successfully",
        settings,
      });
    } catch (error: any) {
      console.error("Error updating cache settings:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await CachingService.getStats();
      return res.json({ success: true, stats });
    } catch (error) {
      console.error("Error fetching cache stats:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async clearAll(req: Request, res: Response) {
    try {
      CachingService.clearAll();
      return res.json({
        success: true,
        message: "All cache cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async clearProducts(req: Request, res: Response) {
    try {
      CachingService.clearProductCache();
      return res.json({
        success: true,
        message: "Product cache cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing product cache:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async clearCategories(req: Request, res: Response) {
    try {
      CachingService.clearCategoryCache();
      return res.json({
        success: true,
        message: "Category cache cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing category cache:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async clearAnalytics(req: Request, res: Response) {
    try {
      CachingService.clearAnalyticsCache();
      return res.json({
        success: true,
        message: "Analytics cache cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing analytics cache:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
