import {prisma} from '../../config/prisma';

export const ReviewService = {
  // Create a new review
  createReview: async (data: {
    productId: string;
    userId: string;
    rating: number;
    comment?: string;
  }) => {
    // Validate rating is between 1-5
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId: data.userId,
        },
      },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return review;
  },

  // Get all reviews for a product
  getProductReviews: async (productId: string, options?: { limit?: number; offset?: number }) => {
    const { limit = 10, offset = 0 } = options || {};

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return {
      reviews,
      totalCount,
      hasMore: offset + reviews.length < totalCount,
    };
  },

  // Get product rating statistics
  getProductRatingStats: async (productId: string) => {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate distribution
    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      ratingDistribution: {
        5: distribution[5] || 0,
        4: distribution[4] || 0,
        3: distribution[3] || 0,
        2: distribution[2] || 0,
        1: distribution[1] || 0,
      },
    };
  },

  // Get a specific review
  getReview: async (reviewId: string) => {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string }
  ) => {
    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new Error('You can only update your own reviews');
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updatedReview;
  },

  // Delete a review
  deleteReview: async (reviewId: string, userId: string, isAdmin: boolean = false) => {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    // Users can only delete their own reviews, admins can delete any
    if (!isAdmin && existingReview.userId !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Review deleted successfully' };
  },

  // Get all reviews by a user
  getUserReviews: async (userId: string, options?: { limit?: number; offset?: number }) => {
    const { limit = 10, offset = 0 } = options || {};

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              price: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return {
      reviews,
      totalCount,
      hasMore: offset + reviews.length < totalCount,
    };
  },

  // Check if user has reviewed a product
  hasUserReviewedProduct: async (productId: string, userId: string) => {
    const review = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    return {
      hasReviewed: !!review,
      review: review || null,
    };
  },
};
