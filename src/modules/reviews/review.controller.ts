import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { createReviewSchema, updateReviewSchema, paginationSchema } from './review.validation';
import { z } from 'zod';

export const ReviewController = {
  // Create a new review
  createReview: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate and sanitize input
      const validatedData = createReviewSchema.parse({
        productId: req.body.productId,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      });

      const reviewData: { productId: string; userId: string; rating: number; comment?: string } = {
        productId: validatedData.productId,
        userId: session.user.id,
        rating: validatedData.rating,
      };

      if (validatedData.comment !== undefined) {
        reviewData.comment = validatedData.comment;
      }

      const review = await ReviewService.createReview(reviewData);

      res.status(201).json({
        message: 'Review created successfully',
        review,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.issues 
        });
      }
      console.error('Error creating review:', error);
      res.status(400).json({ error: error.message || 'Failed to create review' });
    }
  },

  // Get all reviews for a product
  getProductReviews: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Validate pagination parameters
      const pagination = paginationSchema.parse({
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      });

      const result = await ReviewService.getProductReviews(productId, pagination);

      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid pagination parameters', 
          details: error.issues 
        });
      }
      console.error('Error fetching product reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  },

  // Get product rating statistics
  getProductRatingStats: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const stats = await ReviewService.getProductRatingStats(productId);

      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching rating stats:', error);
      res.status(500).json({ error: 'Failed to fetch rating statistics' });
    }
  },

  // Get a specific review
  getReview: async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params;

      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      const review = await ReviewService.getReview(reviewId);

      res.json({ review });
    } catch (error: any) {
      console.error('Error fetching review:', error);
      res.status(404).json({ error: error.message || 'Review not found' });
    }
  },

  // Update a review
  updateReview: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { reviewId } = req.params;
      
      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      // Validate and sanitize input
      const validatedData = updateReviewSchema.parse({
        rating: req.body.rating !== undefined ? Number(req.body.rating) : undefined,
        comment: req.body.comment,
      });

      const updateData: { rating?: number; comment?: string } = {};
      if (validatedData.rating !== undefined) {
        updateData.rating = validatedData.rating;
      }
      if (validatedData.comment !== undefined) {
        updateData.comment = validatedData.comment;
      }

      const updatedReview = await ReviewService.updateReview(
        reviewId,
        session.user.id,
        updateData
      );

      res.json({
        message: 'Review updated successfully',
        review: updatedReview,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.issues 
        });
      }
      console.error('Error updating review:', error);
      res.status(400).json({ error: error.message || 'Failed to update review' });
    }
  },

  // Delete a review
  deleteReview: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { reviewId } = req.params;
      
      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      const isAdmin = session.user.role === 'ADMIN';

      const result = await ReviewService.deleteReview(reviewId, session.user.id, isAdmin);

      res.json(result);
    } catch (error: any) {
      console.error('Error deleting review:', error);
      res.status(400).json({ error: error.message || 'Failed to delete review' });
    }
  },

  // Get all reviews by the authenticated user
  getUserReviews: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate pagination parameters
      const pagination = paginationSchema.parse({
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      });

      const result = await ReviewService.getUserReviews(session.user.id, pagination);

      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid pagination parameters', 
          details: error.issues 
        });
      }
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
  },

  // Check if user has reviewed a product
  checkUserReview: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const result = await ReviewService.hasUserReviewedProduct(productId, session.user.id);

      res.json(result);
    } catch (error: any) {
      console.error('Error checking user review:', error);
      res.status(500).json({ error: 'Failed to check user review' });
    }
  },
};
