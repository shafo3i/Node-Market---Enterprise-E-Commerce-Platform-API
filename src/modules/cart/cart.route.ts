import { Router } from 'express';
import { CartController } from './cart.controller';
import { isAuthenticated } from '../../middleware/auth-middleware';

const router = Router();

// GET /api/cart - Get user's cart
router.get('/', isAuthenticated, CartController.getCart);

// POST /api/cart/items - Add item to cart
router.post('/items', isAuthenticated, CartController.addItem);

// PUT /api/cart/items - Update item quantity
router.put('/items', isAuthenticated, CartController.updateItemQuantity);

// DELETE /api/cart/items/:productId - Remove item from cart
router.delete('/items/:productId', isAuthenticated, CartController.removeItem);

// DELETE /api/cart - Clear entire cart
router.delete('/', isAuthenticated, CartController.clearCart);

export default router;
