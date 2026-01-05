import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Sanitize string helper
const sanitizeString = (str: string) => {
  return str
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove potential XSS characters
};

// Generate slug from name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const createBrandSchema = z.object({
  name: z.string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must be less than 100 characters')
    .transform(sanitizeString),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform(sanitizeString)
    .optional(),
  description: z.union([
    z.string().max(500, 'Description must be less than 500 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  logo: z.union([
    z.string().url('Logo must be a valid URL'),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
}).transform((data) => ({
  ...data,
  // Auto-generate slug if not provided
  slug: data.slug || generateSlug(data.name),
}));

export const updateBrandSchema = z.object({
  name: z.string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must be less than 100 characters')
    .transform(sanitizeString)
    .optional(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform(sanitizeString)
    .optional(),
  description: z.union([
    z.string().max(500, 'Description must be less than 500 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  logo: z.union([
    z.string().url('Logo must be a valid URL'),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
});

// Validation middleware
export const validateCreateBrand = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createBrandSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};

export const validateUpdateBrand = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateBrandSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(error);
  }
};
