import { Request, Response } from 'express';
import { ShippingService } from './shipping.service';

export const ShippingController = {
  /**
   * Calculate shipping rates for checkout
   * POST /api/shipping/calculate
   */
  calculateRates: async (req: Request, res: Response) => {
    try {
      const { subtotal, destination, packageDetails } = req.body;

      if (!subtotal || !destination) {
        return res.status(400).json({ 
          error: 'Subtotal and destination are required',
        });
      }

      if (!destination.country || !destination.postalCode) {
        return res.status(400).json({ 
          error: 'Destination must include country and postal code',
        });
      }

      const rates = await ShippingService.calculateRates(
        Number(subtotal),
        destination,
        packageDetails
      );

      return res.json({
        success: true,
        rates,
      });
    } catch (error) {
      console.error('Calculate rates error:', error);
      return res.status(500).json({ 
        error: 'Failed to calculate shipping rates',
      });
    }
  },
};
