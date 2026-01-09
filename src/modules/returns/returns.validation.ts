import { z } from "zod";
import { ReturnExchangeType, ReturnExchangeStatus } from "../../generated/prisma/enums";

const returnExchangeItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  productName: z.string().min(1, "Product name is required"),
  sku: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(1000, "Reason too long"),
  condition: z.enum(["unopened", "opened", "damaged", "defective"]).optional(),
  
  // For exchanges
  exchangeProductId: z.string().cuid().optional(),
  exchangeProductName: z.string().optional(),
  exchangeProductSku: z.string().optional(),
});

export const createReturnExchangeSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  type: z.nativeEnum(ReturnExchangeType),
  reason: z.string().min(20, "Reason must be at least 20 characters").max(2000, "Reason too long"),
  customerComments: z.string().max(2000, "Comments too long").optional().nullable(),
  images: z.array(z.string().url("Invalid image URL")).max(10, "Maximum 10 images").optional(),
  items: z.array(returnExchangeItemSchema).min(1, "At least one item is required"),
  refundMethod: z.enum(["original_payment", "store_credit"]).optional(),
});

export const updateReturnExchangeSchema = z.object({
  status: z.nativeEnum(ReturnExchangeStatus).optional(),
  adminNotes: z.string().max(2000, "Admin notes too long").optional().nullable(),
  refundAmount: z.number().min(0, "Refund amount must be positive").optional(),
  refundMethod: z.string().optional(),
  returnTrackingNumber: z.string().max(100, "Tracking number too long").optional().nullable(),
  returnCarrier: z.string().max(100, "Carrier name too long").optional().nullable(),
  exchangeOrderId: z.string().cuid().optional().nullable(),
}).strict();

export const returnExchangeIdSchema = z.object({
  id: z.string().cuid("Invalid return/exchange ID"),
});

export const returnNumberSchema = z.object({
  returnNumber: z.string().regex(/^REX-\d{8}-\d{5}$/, "Invalid return number format"),
});

export type CreateReturnExchangeInput = z.infer<typeof createReturnExchangeSchema>;
export type UpdateReturnExchangeInput = z.infer<typeof updateReturnExchangeSchema>;
export type ReturnExchangeIdInput = z.infer<typeof returnExchangeIdSchema>;
export type ReturnNumberInput = z.infer<typeof returnNumberSchema>;
