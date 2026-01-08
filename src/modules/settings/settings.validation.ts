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
