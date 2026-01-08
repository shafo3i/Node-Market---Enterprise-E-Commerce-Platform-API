import { Request, Response } from "express";
import { OrdersService } from "./orders.service";
import { OrderStatus } from "../../generated/prisma/enums";


export const OrdersController = {
  
  checkout: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const userId = session.user.id;
      const { shippingAddressId } = req.body;

      // Create order from cart
      const order = await OrdersService.createOrder(userId, shippingAddressId);

      // Create payment intent
      const paymentIntent = await OrdersService.createPaymentIntent(order.id);

      res.status(200).json({
        success: true,
        orderId: order.id,
        ...paymentIntent,
      });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  createPayment: async (req: Request, res: Response) => {
    
    try {
        const { orderId } = req.body;

         if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
      }
      const paymentIntent = await OrdersService.createPaymentIntent(orderId);
      res.status(200).json(paymentIntent);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
    },

  // Get all orders (admin only)
  getAllOrders: async (req: Request, res: Response) => {
    try {

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const orders = await OrdersService.getAllOrders(limit);
      res.status(200).json({ success: true, orders });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Get user's own orders
  getUserOrders: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const orders = await OrdersService.getUserOrders(session.user.id);
      res.status(200).json({ success: true, orders });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Get order by ID
  getOrderById: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
      }

      const order = await OrdersService.getOrderById(id);

      // Check if user owns order or is admin
      if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      res.status(200).json({ success: true, order });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
     
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
      }

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const order = await OrdersService.updateOrderStatus(id, status, session.user.id);
      res.status(200).json({ success: true, order, message: "Order status updated" });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Cancel order (user can cancel their own pending orders)
  cancelOrder: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
      }

      const order = await OrdersService.cancelOrder(id, session.user.id);
      res.status(200).json({ success: true, order, message: "Order cancelled successfully" });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },
  // Update shipping information (admin only)
  updateShippingInfo: async (req: Request, res: Response) => {
    try {
     
      const { id } = req.params;
      const { trackingNumber, shippingCarrier, status } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
      }
      if (!trackingNumber || !shippingCarrier) {
        return res.status(400).json({ success: false, message: "Tracking number and shipping carrier are required" });
      }
      const order = await OrdersService.updateShippingInfo(id, {
        trackingNumber,
        shippingCarrier: shippingCarrier as string,
        status: status ? status as OrderStatus : OrderStatus.SHIPPED,
      });
      res.status(200).json({ success: true, order, message: "Shipping information updated" });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },
};