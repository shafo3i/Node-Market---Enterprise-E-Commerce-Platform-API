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
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
};

export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .transform(sanitizeString),
  description: z.union([
    z.string().max(500, 'Description must be less than 500 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  image: z.union([
    z.string().url('Image must be a valid URL'),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  metaTitle: z.union([
    z.string().max(60, 'Meta title must be less than 60 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  metaDescription: z.union([
    z.string().max(160, 'Meta description must be less than 160 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  keywords: z.union([
    z.string().max(200, 'Keywords must be less than 200 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .transform(sanitizeString)
    .optional(),
  description: z.union([
    z.string().max(500, 'Description must be less than 500 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  image: z.union([
    z.string().url('Image must be a valid URL'),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  metaTitle: z.union([
    z.string().max(60, 'Meta title must be less than 60 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  metaDescription: z.union([
    z.string().max(160, 'Meta description must be less than 160 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  keywords: z.union([
    z.string().max(200, 'Keywords must be less than 200 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
});

// Validation middleware
export const validateCreateCategory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createCategorySchema.parse(req.body);
    req.body = {
      ...validated,
      slug: generateSlug(validated.name),
    };
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

export const validateUpdateCategory = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateCategorySchema.parse(req.body);
    req.body = {
      ...validated,
      ...(validated.name && { slug: generateSlug(validated.name) }),
    };
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
