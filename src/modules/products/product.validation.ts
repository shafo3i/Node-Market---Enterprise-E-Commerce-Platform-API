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

export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .transform(sanitizeString),
  sku: z.union([
    z.string().min(1).max(50, 'SKU must be less than 50 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  description: z.union([
    z.string().max(2000, 'Description must be less than 2000 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price is too high'),
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .optional()
    .default(0),
  lowStockThreshold: z.number()
    .int('Low stock threshold must be an integer')
    .min(0, 'Low stock threshold cannot be negative')
    .optional()
    .default(10),
  isActive: z.boolean().optional().default(true),
  brandId: z.string()
    .min(1, 'Brand ID is required'),
  categoryId: z.string()
    .min(1, 'Category ID is required'),
  image: z.union([
    z.string().url('Image must be a valid URL'),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  variants: z.array(z.object({
    name: z.string()
      .min(1, 'Variant name is required')
      .max(100, 'Variant name must be less than 100 characters')
      .transform(sanitizeString),
    sku: z.string()
      .min(1, 'SKU is required')
      .max(50, 'SKU must be less than 50 characters')
      .transform(sanitizeString),
    price: z.number()
      .positive('Variant price must be positive')
      .optional(),
    stock: z.number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative'),
  })).optional(),
});

export const updateProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .transform(sanitizeString)
    .optional(),
  sku: z.union([
    z.string().min(1).max(50, 'SKU must be less than 50 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  description: z.union([
    z.string().max(2000, 'Description must be less than 2000 characters').transform(sanitizeString),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price is too high')
    .optional(),
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .optional(),
  lowStockThreshold: z.number()
    .int('Low stock threshold must be an integer')
    .min(0, 'Low stock threshold cannot be negative')
    .optional(),
  isActive: z.boolean().optional(),
  brandId: z.string()
    .min(1, 'Brand ID is required')
    .optional(),
  categoryId: z.string()
    .min(1, 'Category ID is required')
    .optional(),
  image: z.union([
    z.string().url('Image must be a valid URL'),
    z.null(),
    z.literal(''),
  ]).transform(val => val === '' || val === null ? null : val).optional(),
});

// Validation middleware
export const validateCreateProduct = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createProductSchema.parse(req.body);
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

export const validateUpdateProduct = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateProductSchema.parse(req.body);
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
