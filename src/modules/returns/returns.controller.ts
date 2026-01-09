import { Request, Response } from "express";
import { ReturnsService } from "./returns.service";
import {
  createReturnExchangeSchema,
  updateReturnExchangeSchema,
  returnExchangeIdSchema,
  returnNumberSchema,
} from "./returns.validation";
import { ReturnExchangeStatus } from "../../generated/prisma/enums";
import { prisma } from "../../config/prisma";

export const ReturnsController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const returns = await ReturnsService.getAll();
      return res.json({ success: true, returns });
    } catch (error) {
      console.error("Error fetching returns/exchanges:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const validated = returnExchangeIdSchema.safeParse(req.params);
      if (!validated.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validated.error.format(),
        });
      }

      const returnExchange = await ReturnsService.getById(validated.data.id);
      if (!returnExchange) {
        return res.status(404).json({ error: "Return/Exchange not found" });
      }

      return res.json({ success: true, return: returnExchange });
    } catch (error) {
      console.error("Error fetching return/exchange:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getByReturnNumber: async (req: Request, res: Response) => {
    try {
      const validated = returnNumberSchema.safeParse(req.params);
      if (!validated.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validated.error.format(),
        });
      }

      const returnExchange = await ReturnsService.getByReturnNumber(validated.data.returnNumber);
      if (!returnExchange) {
        return res.status(404).json({ error: "Return/Exchange not found" });
      }

      return res.json({ success: true, return: returnExchange });
    } catch (error) {
      console.error("Error fetching return/exchange:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getByStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status parameter is required" });
      }

      const returns = await ReturnsService.getByStatus(status as ReturnExchangeStatus);
      return res.json({ success: true, returns });
    } catch (error) {
      console.error("Error fetching returns by status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      
      const validated = createReturnExchangeSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validated.error.format(),
        });
      }

      // Verify order belongs to user (for non-admin users)
      const order = await prisma.order.findUnique({
        where: { id: validated.data.orderId },
        select: { userId: true },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if user is admin or order owner
      const isAdmin = session.user.role === 'ADMIN';
      if (!isAdmin && order.userId !== session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const returnExchange = await ReturnsService.create(
        validated.data,
        session.user.id
      );

      return res.status(201).json({
        success: true,
        message: "Return/Exchange request created successfully",
        return: returnExchange,
      });
    } catch (error: any) {
      console.error("Error creating return/exchange:", error);
      if (error.message.includes('not found') || error.message.includes('exceeds')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      
      const validatedId = returnExchangeIdSchema.safeParse(req.params);
      if (!validatedId.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validatedId.error.format(),
        });
      }

      const validated = updateReturnExchangeSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validated.error.format(),
        });
      }

      const returnExchange = await ReturnsService.update(
        validatedId.data.id,
        validated.data,
        session.user.id
      );

      return res.json({
        success: true,
        message: "Return/Exchange updated successfully",
        return: returnExchange,
      });
    } catch (error: any) {
      console.error("Error updating return/exchange:", error);
      if (error.message === 'Return/Exchange not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      
      const validated = returnExchangeIdSchema.safeParse(req.params);
      if (!validated.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validated.error.format(),
        });
      }

      await ReturnsService.delete(validated.data.id, session.user.id);
      
      return res.json({
        success: true,
        message: "Return/Exchange deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting return/exchange:", error);
      if (error.message === 'Return/Exchange not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Cannot delete')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getStatistics: async (req: Request, res: Response) => {
    try {
      const stats = await ReturnsService.getStatistics();
      return res.json({ success: true, statistics: stats });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getMyReturns: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const returns = await ReturnsService.getByUserId(session.user.id);
      return res.json({ success: true, returns });
    } catch (error) {
      console.error("Error fetching user returns:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getByOrderId: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }
      
      // Verify order belongs to user
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.userId !== session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const returns = await ReturnsService.getByOrderId(orderId);
      return res.json({ success: true, returns });
    } catch (error) {
      console.error("Error fetching order returns:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
