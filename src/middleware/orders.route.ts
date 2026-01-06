// import { Router } from "express";
// import { OrdersController } from "./orders.controller";

// const router = Router();

// // Public/user routes
// router.post('/checkout', OrdersController.checkout);
// router.post('/payment', OrdersController.createPayment);
// router.post('/:id/cancel', OrdersController.cancelOrder);
// router.get('/my-orders', OrdersController.getUserOrders);
// router.get('/:id', OrdersController.getOrderById);

// // Admin routes
// router.get('/', OrdersController.getAllOrders);
// router.put('/:id/status', OrdersController.updateOrderStatus);
// router.put('/:id/shipping', OrdersController.updateShippingInfo);

// export default router;



// import { Router } from "express";
// import { OrdersController } from "./orders.controller";
// import { isAuthenticated, requireRole } from "../../middleware/auth-middleware";

// const router = Router();

// // Public/user routes
// router.post('/checkout', isAuthenticated, OrdersController.checkout);
// router.post('/payment', isAuthenticated, OrdersController.createPayment);
// router.post('/:id/cancel', isAuthenticated, OrdersController.cancelOrder);
// router.get('/my-orders', isAuthenticated, OrdersController.getUserOrders);
// router.get('/:id', isAuthenticated, OrdersController.getOrderById);

// // Admin routes
// router.get('/', isAuthenticated, requireRole("ADMIN"), OrdersController.getAllOrders);
// router.put('/:id/status', isAuthenticated, requireRole("ADMIN"), OrdersController.updateOrderStatus);
// router.put('/:id/shipping', isAuthenticated, requireRole("ADMIN"), OrdersController.updateShippingInfo);

// export default router;
