import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { isAuthenticated } from '../../middleware/auth-middleware';

const router = Router();

// All wishlist routes require authentication
router.get('/', isAuthenticated, WishlistController.getWishlist);
router.post('/', isAuthenticated, WishlistController.addToWishlist);
router.delete('/:productId', isAuthenticated, WishlistController.removeFromWishlist);
router.delete('/', isAuthenticated, WishlistController.clearWishlist);
router.get('/check/:productId', isAuthenticated, WishlistController.isInWishlist);

export default router;
