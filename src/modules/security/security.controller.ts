import { Request, Response } from "express";
import { SecurityService } from "./security.service";
import { updateDebugModeSchema } from "./security.validation";

export const SecurityController = {
  async getDebugMode(req: Request, res: Response) {
    try {
      const settings = await SecurityService.getDebugMode();
      return res.json({ success: true, debugMode: settings });
    } catch (error) {
      console.error("Error fetching debug mode settings:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async updateDebugMode(req: Request, res: Response) {
    try {
      const session = res.locals.session;
      
      const validated = updateDebugModeSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const settings = await SecurityService.updateDebugMode(
        validated.data,
        session.user.id
      );

      return res.json({
        success: true,
        message: "Debug mode updated successfully",
        debugMode: settings,
      });
    } catch (error: any) {
      console.error("Error updating debug mode:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
