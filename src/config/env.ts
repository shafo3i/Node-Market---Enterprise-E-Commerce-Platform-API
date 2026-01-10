import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL_HOST: z.string().url(),


  // Cloudflare API - Optional
  CF_TURNSTILE_SECRET_KEY: z.string().optional(),
  CF_TURNSTILE_SITE_KEY: z.string().optional(),
  
  // Stripe - Publishable key optional for backend-only development
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  
  // Security
  CSRF_SECRET: z.string().min(32, 'CSRF secret must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().length(64, 'Encryption key must be exactly 64 hex characters (32 bytes)'),
  
  // SMTP - Optional in development
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().min(1).max(65535).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().min(8).optional(),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3003),
  
  // Optional S3
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);