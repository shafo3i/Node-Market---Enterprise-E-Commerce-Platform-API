import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50).optional().or(z.literal('')).transform(val => val || undefined),
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']).default('BOTH'),
  street: z.string().min(3).max(200),
  street2: z.string().max(200).optional().or(z.literal('')).transform(val => val || undefined),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/).optional().or(z.literal('')).transform(val => val || undefined),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  label: z.string().min(1).max(50).optional().or(z.literal('')).transform(val => val || undefined),
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']).optional(),
  street: z.string().min(3).max(200).optional(),
  street2: z.string().max(200).optional().or(z.literal('')).transform(val => val || undefined),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  postalCode: z.string().min(3).max(20).optional(),
  country: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/).optional().or(z.literal('')).transform(val => val || undefined),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
