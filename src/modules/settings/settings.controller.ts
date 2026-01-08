import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import {
  updateCurrencySchema,
  updatePaymentMethodsSchema,
  updateStripeKeysSchema,
  updateSmtpSettingsSchema,
  updateStoreInfoSchema,
} from './settings.validation';
import fs from 'fs/promises';
import path from 'path';

export const SettingsController = {
  /**
   * Get current store currency (PUBLIC - no auth required)
   */
  async getCurrency(req: Request, res: Response) {
    try {
      const currency = await SettingsService.getCurrency();
      res.json({ success: true, currency });
    } catch (error: any) {
      console.error('Get currency error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get currency',
        currency: 'USD' // Fallback
      });
    }
  },

  /**
   * Get all store settings
   * SECURITY: Admin only
   */
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.getAllSettings();
      const stripeKeys = SettingsService.getStripeKeys();
      const smtpSettings = await SettingsService.getSmtpSettings();
      const storeInfo = await SettingsService.getStoreInfo();

      res.json({
        ...settings,
        stripe: stripeKeys,
        smtp: smtpSettings,
        storeInfo,
      });
    } catch (error: any) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  },

  /**
   * Update store currency
   * SECURITY: Admin only
   */
  async updateCurrency(req: Request, res: Response) {
    const validate = updateCurrencySchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({ error: validate.error.message });
    }

    try {
      await SettingsService.updateCurrency(validate.data.currency);
      res.json({ message: 'Currency updated successfully' });
    } catch (error: any) {
      console.error('Update currency error:', error);
      res.status(500).json({ error: 'Failed to update currency' });
    }
  },

  /**
   * Update accepted payment methods
   * SECURITY: Admin only
   */
  async updatePaymentMethods(req: Request, res: Response) {
    const validate = updatePaymentMethodsSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({ error: validate.error.message });
    }

    try {
      await SettingsService.updatePaymentMethods(validate.data);
      res.json({ message: 'Payment methods updated successfully' });
    } catch (error: any) {
      console.error('Update payment methods error:', error);
      res.status(500).json({ error: 'Failed to update payment methods' });
    }
  },

  /**
   * Update Stripe API keys
   * SECURITY: Admin only
   * WARNING: This updates the .env file - use with caution
   */
  async updateStripeKeys(req: Request, res: Response) {
    const validate = updateStripeKeysSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({ error: validate.error.message });
    }

    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = await fs.readFile(envPath, 'utf-8');

      // Update each key if provided
      if (validate.data.publishableKey) {
        envContent = envContent.replace(
          /STRIPE_PUBLISHABLE_KEY=.*/,
          `STRIPE_PUBLISHABLE_KEY=${validate.data.publishableKey}`
        );
      }

      if (validate.data.secretKey) {
        envContent = envContent.replace(
          /STRIPE_SECRET_KEY=.*/,
          `STRIPE_SECRET_KEY=${validate.data.secretKey}`
        );
      }

      if (validate.data.webhookSecret) {
        envContent = envContent.replace(
          /STRIPE_WEBHOOK_SECRET=.*/,
          `STRIPE_WEBHOOK_SECRET=${validate.data.webhookSecret}`
        );
      }

      await fs.writeFile(envPath, envContent, 'utf-8');

      res.json({ 
        message: 'Stripe keys updated successfully. Please restart the server for changes to take effect.',
        requiresRestart: true,
      });
    } catch (error: any) {
      console.error('Update Stripe keys error:', error);
      res.status(500).json({ error: 'Failed to update Stripe keys' });
    }
  },

  /**
   * Update SMTP settings
   * SECURITY: Admin only
   * WARNING: This updates the .env file - use with caution
   */
  async updateSmtpSettings(req: Request, res: Response) {
    const validate = updateSmtpSettingsSchema.safeParse(req.body);
    if (!validate.success) {
      return res.status(400).json({ error: validate.error.message });
    }

    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = await fs.readFile(envPath, 'utf-8');

      // Update SMTP settings
      const { host, port, smtpUser, password, smtpSecure, smtpFrom } = validate.data;

      envContent = envContent.replace(
        /SMTP_HOST=.*/,
        `SMTP_HOST=${host}`
      );
      envContent = envContent.replace(
        /SMTP_PORT=.*/,
        `SMTP_PORT=${port}`
      );
      envContent = envContent.replace(
        /SMTP_USER=.*/,
        `SMTP_USER=${smtpUser}`
      );
      envContent = envContent.replace(
        /SMTP_PASSWORD=.*/,
        `SMTP_PASSWORD=${password}`
      );
      envContent = envContent.replace(
        /SMTP_SECURE=.*/,
        `SMTP_SECURE=${smtpSecure}`
      );
      envContent = envContent.replace(
        /SMTP_FROM=.*/,
        `SMTP_FROM=${smtpFrom}`
      );

      await fs.writeFile(envPath, envContent, 'utf-8');

      // Update runtime environment
      process.env.SMTP_HOST = host;
      process.env.SMTP_PORT = port.toString();
      process.env.SMTP_USER = smtpUser;
      process.env.SMTP_PASSWORD = password;
      process.env.SMTP_SECURE = smtpSecure.toString();
      process.env.SMTP_FROM = smtpFrom;

      res.json({ 
        message: 'SMTP settings updated successfully. Please restart the server for changes to take effect.',
        requiresRestart: true,
      });
    } catch (error: any) {
      console.error('Update SMTP settings error:', error);
      res.status(500).json({ error: 'Failed to update SMTP settings' });
    }
  },

  /**
   * Update store information
   * SECURITY: Admin only
   */
  async updateStoreInfo(req: Request, res: Response) {
    const validate = updateStoreInfoSchema.safeParse(req.body);

    if (!validate.success) {
      return res.status(400).json({ error: validate.error.message });
    }

    try {
      await SettingsService.updateStoreInfo(validate.data);

      res.json({
        message: 'Store information updated successfully',
      });
    } catch (error: any) {
      console.error('Update store info error:', error);
      res.status(500).json({ error: 'Failed to update store information' });
    }
  },
};
