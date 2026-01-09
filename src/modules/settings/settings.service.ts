import { prisma } from '../../config/prisma';

interface PaymentMethods {
  creditCard: boolean;
  applePay: boolean;
  googlePay: boolean;
}

export const SettingsService = {
  /**
   * Get store currency setting
   */
  getCurrency: async (): Promise<string> => {
    const setting = await prisma.settings.findUnique({
      where: { key: 'store_currency' },
    });
    return setting?.value as string || 'GBP';
  },

  /**
   * Update store currency
   */
  updateCurrency: async (currency: string): Promise<void> => {
    await prisma.settings.upsert({
      where: { key: 'store_currency' },
      update: { value: currency },
      create: { key: 'store_currency', value: currency },
    });
  },

  /**
   * Get accepted payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethods> => {
    const setting = await prisma.settings.findUnique({
      where: { key: 'payment_methods' },
    });
    return (setting?.value as unknown as PaymentMethods) || {
      creditCard: true,
      applePay: false,
      googlePay: false,
    };
  },

  /**
   * Update accepted payment methods
   */
  updatePaymentMethods: async (methods: PaymentMethods): Promise<void> => {
    await prisma.settings.upsert({
      where: { key: 'payment_methods' },
      update: { value: methods as any },
      create: { key: 'payment_methods', value: methods as any },
    });
  },

  /**
   * Get all general settings
   */
  getAllSettings: async () => {
    const [currency, paymentMethods] = await Promise.all([
      SettingsService.getCurrency(),
      SettingsService.getPaymentMethods(),
    ]);

    return {
      currency,
      paymentMethods,
      // Stripe keys are NOT included here - handled separately for security
    };
  },

  /**
   * Get masked Stripe keys (for display only)
   */
  getStripeKeys: () => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';
    const secretKey = process.env.STRIPE_SECRET_KEY || '';

    return {
      publishableKey: publishableKey 
        ? `${publishableKey.substring(0, 12)}••••••••${publishableKey.slice(-4)}`
        : '',
      secretKey: secretKey 
        ? `${secretKey.substring(0, 8)}••••••••${secretKey.slice(-4)}`
        : '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET 
        ? `whsec_••••••••${process.env.STRIPE_WEBHOOK_SECRET.slice(-4)}`
        : '',
    };
  },

  getSmtpSettings: async () => {
    const host = process.env.SMTP_HOST || '';
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : null;
    const smtpUser = process.env.SMTP_USER || '';
    const password = process.env.SMTP_PASSWORD || '';
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpFrom = process.env.SMTP_FROM || '';
    return { host, port, smtpUser, password, smtpSecure, smtpFrom };
  },
  async getStoreInfo() {
    const storeInfo = await prisma.storeSettings.findFirst();
    
    if (!storeInfo) {
      return {
        storeName: '',
        storeDescription: '',
        storeLogo: '',
        storeEmail: '',
        storePhone: '',
        storeWebsite: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressPostal: '',
        addressCountry: '',
        businessHours: '',
        timezone: 'UTC',
      };
    }

    return {
      storeName: storeInfo.storeName || '',
      storeDescription: storeInfo.storeDescription || '',
      storeLogo: storeInfo.storeLogo || '',
      storeEmail: storeInfo.storeEmail || '',
      storePhone: storeInfo.storePhone || '',
      storeWebsite: storeInfo.storeWebsite || '',
      addressStreet: storeInfo.addressStreet || '',
      addressCity: storeInfo.addressCity || '',
      addressState: storeInfo.addressState || '',
      addressPostal: storeInfo.addressPostal || '',
      addressCountry: storeInfo.addressCountry || '',
      businessHours: storeInfo.businessHours || '',
      timezone: storeInfo.timezone || 'UTC',
    };
  },

  async updateStoreInfo(data: any) {
    const existing = await prisma.storeSettings.findFirst();

    if (existing) {
      await prisma.storeSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.storeSettings.create({
        data,
      });
    }
  },
  updateSmtpSettings: async (settings: {
    host: string;
    port: number;
    smtpUser: string;
    password: string;
    smtpSecure: boolean;
    smtpFrom: string;
  }) => {
    process.env.SMTP_HOST = settings.host;
    process.env.SMTP_PORT = settings.port.toString();
    process.env.SMTP_USER = settings.smtpUser;
    process.env.SMTP_PASSWORD = settings.password;
    process.env.SMTP_SECURE = settings.smtpSecure ? 'true' : 'false';
    process.env.SMTP_FROM = settings.smtpFrom;
    // Note: In a real application, you'd want to persist these changes securely
  },
};