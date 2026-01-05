import { z } from "zod";

// Regex patterns for validation
const TRACKING_URL_REGEX = /^https?:\/\/.+\{trackingNumber\}.*/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 format
const NAME_REGEX = /^[a-zA-Z0-9\s\-&.']+$/; // Alphanumeric with common business characters
const CODE_REGEX = /^[A-Z0-9_]{2,20}$/; // Uppercase letters, numbers, underscores, 2-20 chars

export const createCarrierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(NAME_REGEX, "Name contains invalid characters"),
  
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(CODE_REGEX, "Code must be 2-20 uppercase letters, numbers, or underscores (e.g., ROYAL_MAIL, DHL, FEDEX)"),
  
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  trackingUrl: z
    .string()
    .trim()
    .url("Invalid URL format")
    .regex(TRACKING_URL_REGEX, "Tracking URL must contain {trackingNumber} placeholder")
    .max(500, "Tracking URL must not exceed 500 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  contactEmail: z
    .string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  contactPhone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Invalid phone number format (use E.164 format, e.g., +1234567890)")
    .max(20, "Phone number must not exceed 20 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  estimatedDays: z
    .number()
    .int("Estimated days must be an integer")
    .min(0, "Estimated days must be 0 or greater")
    .max(365, "Estimated days must not exceed 365")
    .optional()
    .nullable(),
  
  isActive: z
    .boolean()
    .default(true),
});

export const updateCarrierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(NAME_REGEX, "Name contains invalid characters")
    .optional(),
  
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(CODE_REGEX, "Code must be 2-20 uppercase letters, numbers, or underscores (e.g., ROYAL_MAIL, DHL, FEDEX)")
    .optional(),
  
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  trackingUrl: z
    .string()
    .trim()
    .url("Invalid URL format")
    .regex(TRACKING_URL_REGEX, "Tracking URL must contain {trackingNumber} placeholder")
    .max(500, "Tracking URL must not exceed 500 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  contactEmail: z
    .string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  contactPhone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Invalid phone number format (use E.164 format, e.g., +1234567890)")
    .max(20, "Phone number must not exceed 20 characters")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  
  estimatedDays: z
    .number()
    .int("Estimated days must be an integer")
    .min(0, "Estimated days must be 0 or greater")
    .max(365, "Estimated days must not exceed 365")
    .optional()
    .nullable(),
  
  isActive: z
    .boolean()
    .optional(),
}).strict();

export const carrierIdSchema = z.object({
  id: z
    .string()
    .cuid("Invalid carrier ID format"),
});

export type CreateCarrierInput = z.infer<typeof createCarrierSchema>;
export type UpdateCarrierInput = z.infer<typeof updateCarrierSchema>;
export type CarrierIdInput = z.infer<typeof carrierIdSchema>;
