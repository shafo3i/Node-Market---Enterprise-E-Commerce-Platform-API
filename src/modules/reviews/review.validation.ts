import { z } from 'zod';

// Sanitize HTML and trim whitespace
const sanitizeString = (str: string) => {
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove < and > characters
};

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string()
    .max(2000, 'Comment must be less than 2000 characters')
    .transform(sanitizeString)
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comment: z.string()
    .max(2000, 'Comment must be less than 2000 characters')
    .transform(sanitizeString)
    .optional(),
}).refine(data => data.rating !== undefined || data.comment !== undefined, {
  message: 'At least one field (rating or comment) must be provided',
});

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
