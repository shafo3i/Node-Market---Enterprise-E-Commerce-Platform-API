import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  orderId: z.string().cuid(),
});

export const getInvoiceSchema = z.object({
  invoiceId: z.string().cuid(),
});

export const updateInvoiceStatusSchema = z.object({
  invoiceId: z.string().cuid(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']),
});

export const regenerateInvoiceSchema = z.object({
  invoiceId: z.string().cuid(),
  notes: z.string().optional(),
});
