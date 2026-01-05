import { Router } from 'express';
import { WishlistController } from './wishlist.controller';

const router = Router();

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);
router.delete('/', WishlistController.clearWishlist);
router.get('/check/:productId', WishlistController.isInWishlist);

export default router;
