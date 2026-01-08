import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { isAdmin } from '../../middleware/auth-middleware';

const router = Router();

/**
 * PUBLIC ROUTES (no authentication required)
 */
// Get current store currency - PUBLIC
router.get('/currency', SettingsController.getCurrency);

/**
 * ADMIN ONLY ROUTES
 * SECURITY: isAdmin middleware checks authentication and ADMIN role
 */

// Get all settings
router.get('/', isAdmin, SettingsController.getSettings);

// Update currency
router.put('/currency', isAdmin, SettingsController.updateCurrency);

// Update payment methods
router.put('/payment-methods', isAdmin, SettingsController.updatePaymentMethods);

// Update Stripe keys (HIGHLY SENSITIVE)
router.put('/stripe-keys', isAdmin, SettingsController.updateStripeKeys);

// Update SMTP settings (HIGHLY SENSITIVE)
router.put('/smtp', isAdmin, SettingsController.updateSmtpSettings);

export default router;
