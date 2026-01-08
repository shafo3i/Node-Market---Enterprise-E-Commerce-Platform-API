import { z } from 'zod';

export const updateCurrencySchema = z.object({
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
});

export const updatePaymentMethodsSchema = z.object({
  creditCard: z.boolean(),
  applePay: z.boolean(),
  googlePay: z.boolean(),
});

export const updateStripeKeysSchema = z.object({
  publishableKey: z.string().startsWith('pk_').optional(),
  secretKey: z.string().startsWith('sk_').optional(),
  webhookSecret: z.string().startsWith('whsec_').optional(),
});

// smtp settings schema
export const updateSmtpSettingsSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1, 'Port must be a positive integer'),
  smtpUser: z.string().min(1, 'SMTP user is required'),
  password: z.string().min(1, 'SMTP password is required'),
  smtpSecure: z.boolean(),
  smtpFrom: z.string().min(1, 'SMTP from address is required'),
});
export const updateStoreInfoSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeDescription: z.string().optional(),
  storeLogo: z.string().optional(),
  storeEmail: z.string().email('Invalid email').optional(),
  storePhone: z.string().optional(),
  storeWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressPostal: z.string().optional(),
  addressCountry: z.string().optional(),
  businessHours: z.string().optional(),
  timezone: z.string().optional(),
});