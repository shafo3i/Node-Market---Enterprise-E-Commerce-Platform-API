import { Router } from "express";
import { OrdersController } from "./orders.controller";

const router = Router();

// Public/user routes
router.post('/checkout', OrdersController.checkout);
router.post('/payment', OrdersController.createPayment);
router.post('/:id/cancel', OrdersController.cancelOrder);
router.get('/my-orders', OrdersController.getUserOrders);
router.get('/:id', OrdersController.getOrderById);

// Admin routes
router.get('/', OrdersController.getAllOrders);
router.put('/:id/status', OrdersController.updateOrderStatus);
router.put('/:id/shipping', OrdersController.updateShippingInfo);

export default router;
