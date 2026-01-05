import { Request, Response } from "express";
import { CarrierService } from "./carrier.service";
import { auth } from "../../auth";
import { fromNodeHeaders } from "better-auth/node";
import { 
  createCarrierSchema, 
  updateCarrierSchema, 
  carrierIdSchema,
  CreateCarrierInput,
  UpdateCarrierInput 
} from "./carrier.validation";
import { z } from "zod";

export const CarrierController = {
  // Get all carriers (Admin only)
  async getAllCarriers(req: Request, res: Response) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
      const carriers = await CarrierService.getAllCarriers();
      return res.json(carriers);
    } catch (error) {
      console.error("Error fetching carriers:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get active carriers (Public - for checkout)
  async getActiveCarriers(req: Request, res: Response) {
    try {
      const carriers = await CarrierService.getActiveCarriers();
      return res.json(carriers);
    } catch (error) {
      console.error("Error fetching active carriers:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get carrier by ID (Admin only)
  async getCarrierById(req: Request, res: Response) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
      // Validate ID
      const validated = carrierIdSchema.safeParse(req.params);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const { id } = validated.data;
      const carrier = await CarrierService.getCarrierById(id);
      
      if (!carrier) {
        return res.status(404).json({ error: "Carrier not found" });
      }

      return res.json(carrier);
    } catch (error) {
      console.error("Error fetching carrier:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Create new carrier (Admin only)
  async createCarrier(req: Request, res: Response) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
      // Validate input with Zod
      const validated = createCarrierSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const carrier = await CarrierService.createCarrier(
        validated.data,
        session.user.id
      );

      return res.status(201).json(carrier);
    } catch (error: any) {
      console.error("Error creating carrier:", error);
      if (error.message.includes('already exists') || 
          error.message.includes('Tracking URL') ||
          error.message.includes('Invalid email') ||
          error.message.includes('Estimated days')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Update carrier (Admin only)
  async updateCarrier(req: Request, res: Response) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
      // Validate ID
      const validatedId = carrierIdSchema.safeParse(req.params);
      if (!validatedId.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validatedId.error.format() 
        });
      }

      // Validate body
      const validated = updateCarrierSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const carrier = await CarrierService.updateCarrier(
        validatedId.data.id,
        validated.data,
        session.user.id
      );

      return res.json(carrier);
    } catch (error: any) {
      console.error("Error updating carrier:", error);
      if (error.message === 'Carrier not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('already exists') || 
          error.message.includes('Tracking URL') ||
          error.message.includes('Invalid email') ||
          error.message.includes('Estimated days')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Delete carrier (Admin only)
  async deleteCarrier(req: Request, res: Response) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
      // Validate ID
      const validated = carrierIdSchema.safeParse(req.params);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const { id } = validated.data;
      await CarrierService.deleteCarrier(id, session.user.id);
      return res.json({ message: "Carrier deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting carrier:", error);
      if (error.message === 'Carrier not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Cannot delete carrier')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Toggle carrier status (Admin only)
  async toggleCarrierStatus(req: Request, res: Response) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
      // Validate ID
      const validated = carrierIdSchema.safeParse(req.params);
      if (!validated.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validated.error.format() 
        });
      }

      const { id } = validated.data;
      const carrier = await CarrierService.toggleCarrierStatus(id, session.user.id);
      return res.json(carrier);
    } catch (error: any) {
      console.error("Error toggling carrier status:", error);
      if (error.message === 'Carrier not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
