import { Router } from 'express';
import { ShippingController } from './shipping.controller';

const router = Router();

// Calculate shipping rates (public - for checkout)
router.post('/calculate', ShippingController.calculateRates);

export default router;
