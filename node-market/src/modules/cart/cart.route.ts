import { Router } from 'express';
import { CartController } from './cart.controller';

const router = Router();

// GET /api/cart - Get user's cart
router.get('/', CartController.getCart);

// POST /api/cart/items - Add item to cart
router.post('/items', CartController.addItem);

// PUT /api/cart/items - Update item quantity
router.put('/items', CartController.updateItemQuantity);

// DELETE /api/cart/items/:productId - Remove item from cart
router.delete('/items/:productId', CartController.removeItem);

// DELETE /api/cart - Clear entire cart
router.delete('/', CartController.clearCart);

export default router;
