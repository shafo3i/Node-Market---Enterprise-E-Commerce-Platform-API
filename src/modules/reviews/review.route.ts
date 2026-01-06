import { Router } from 'express';
import { ReviewController } from './review.controller';
import { isAuthenticated } from '../../middleware/auth-middleware';

const router = Router();

// Public routes
router.get('/products/:productId/reviews', ReviewController.getProductReviews);
router.get('/products/:productId/rating-stats', ReviewController.getProductRatingStats);
router.get('/:reviewId', ReviewController.getReview);

// Protected routes (require authentication)
router.post('/', isAuthenticated, ReviewController.createReview);
router.get('/user/my-reviews', isAuthenticated, ReviewController.getUserReviews);
router.get('/products/:productId/check', isAuthenticated, ReviewController.checkUserReview);
router.patch('/:reviewId', isAuthenticated, ReviewController.updateReview);
router.delete('/:reviewId', isAuthenticated, ReviewController.deleteReview);

export default router;
