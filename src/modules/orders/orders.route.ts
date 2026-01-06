import { Router } from "express";
import { OrdersController } from "./orders.controller";
import { isAdmin, isAuthenticated } from "../../middleware/auth-middleware";

const router = Router();

// Public/user routes
router.post('/checkout', isAuthenticated, OrdersController.checkout);
router.post('/payment', isAuthenticated, OrdersController.createPayment);
router.post('/:id/cancel', isAuthenticated, OrdersController.cancelOrder);
router.get('/my-orders', isAuthenticated, OrdersController.getUserOrders);
router.get('/:id', isAuthenticated, OrdersController.getOrderById);

// Admin routes
router.get('/', isAdmin, OrdersController.getAllOrders);
router.put('/:id/status', isAdmin, OrdersController.updateOrderStatus);
router.put('/:id/shipping', isAdmin, OrdersController.updateShippingInfo);

export default router;
