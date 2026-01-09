import { prisma } from '../../config/prisma';

interface ShippingAddress {
  country: string;
  postalCode: string;
  city: string;
  state?: string;
}

interface PackageDetails {
  weight?: number; // in kg
  length?: number; // in cm
  width?: number;
  height?: number;
}

interface ShippingOption {
  carrierId: string;
  carrierName: string;
  carrierCode: string;
  cost: number;
  estimatedDays: number | null;
  rateType: 'FLAT' | 'API';
  apiProvider?: string;
}

export const ShippingService = {
  /**
   * Calculate shipping rates for all available carriers
   */
  calculateRates: async (
    subtotal: number,
    destination: ShippingAddress,
    packageDetails?: PackageDetails
  ): Promise<ShippingOption[]> => {
    const carriers = await prisma.carrier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    console.log(`Found ${carriers.length} active carriers`);

    const options: ShippingOption[] = [];

    for (const carrier of carriers) {
      let cost = 0;
      let canShip = true;

      if (carrier.rateType === 'FLAT') {
        // Flat rate calculation
        if (!carrier.flatRate) {
          console.log(`Skipping ${carrier.name}: No flat rate configured`);
          continue; // Skip if no flat rate configured
        }

        cost = Number(carrier.flatRate);

        // Check if order qualifies for free shipping
        if (carrier.freeThreshold && subtotal >= Number(carrier.freeThreshold)) {
          cost = 0;
        }
      } else if (carrier.rateType === 'API') {
        // API rate calculation
        if (!carrier.apiEnabled || !carrier.apiProvider) {
          console.log(`Skipping ${carrier.name}: API not enabled or provider not set`);
          continue; // Skip if API not configured
        }

        try {
          const apiRate = await ShippingService.getAPIRate(
            carrier.apiProvider,
            carrier.apiKey || '',
            carrier.apiAccountId || '',
            destination,
            packageDetails
          );

          if (apiRate === null) {
            canShip = false;
            continue;
          }

          cost = apiRate;
        } catch (error) {
          console.error(`Failed to get rate from ${carrier.apiProvider}:`, error);
          canShip = false;
          continue;
        }
      }

      if (canShip) {
        console.log(`Adding ${carrier.name}: ${cost} (${carrier.rateType})`);
        options.push({
          carrierId: carrier.id,
          carrierName: carrier.name,
          carrierCode: carrier.code,
          cost,
          estimatedDays: carrier.estimatedDays,
          rateType: carrier.rateType,
          ...(carrier.apiProvider && { apiProvider: carrier.apiProvider }),
        });
      }
    }

    console.log(`Returning ${options.length} shipping options`);
    // Sort by price (cheapest first)
    return options.sort((a, b) => a.cost - b.cost);
  },

  /**
   * Get shipping rate from carrier API
   */
  getAPIRate: async (
    provider: string,
    apiKey: string,
    accountId: string,
    destination: ShippingAddress,
    packageDetails?: PackageDetails
  ): Promise<number | null> => {
    switch (provider.toLowerCase()) {
      case 'royal_mail':
        return ShippingService.getRoyalMailRate(apiKey, accountId, destination, packageDetails);
      
      case 'ups':
        return ShippingService.getUPSRate(apiKey, accountId, destination, packageDetails);
      
      case 'fedex':
        return ShippingService.getFedExRate(apiKey, accountId, destination, packageDetails);
      
      case 'dhl':
        return ShippingService.getDHLRate(apiKey, accountId, destination, packageDetails);
      
      default:
        console.error(`Unknown API provider: ${provider}`);
        return null;
    }
  },

  /**
   * Royal Mail API integration (UK)
   * Docs: https://www.royalmail.com/services/online-shipping-api
   */
  getRoyalMailRate: async (
    apiKey: string,
    accountId: string,
    destination: ShippingAddress,
    packageDetails?: PackageDetails
  ): Promise<number | null> => {
    try {
      // TODO: Implement Royal Mail API call
      // This is a placeholder - you'll need to implement actual API call
      console.log('Royal Mail API called for:', destination.country);
      
      // Example response structure (implement actual API call):
      // const response = await fetch('https://api.royalmail.com/shipping/v2/rates', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     accountNumber: accountId,
      //     destination: {
      //       countryCode: destination.country,
      //       postalCode: destination.postalCode,
      //     },
      //     package: packageDetails,
      //   }),
      // });
      
      // For now, return null to indicate not implemented
      return null;
    } catch (error) {
      console.error('Royal Mail API error:', error);
      return null;
    }
  },

  /**
   * UPS API integration
   * Docs: https://developer.ups.com
   */
  getUPSRate: async (
    apiKey: string,
    accountId: string,
    destination: ShippingAddress,
    packageDetails?: PackageDetails
  ): Promise<number | null> => {
    try {
      // TODO: Implement UPS API call
      console.log('UPS API called for:', destination.country);
      
      // Example structure:
      // const response = await fetch('https://onlinetools.ups.com/api/rating/v1/Rate', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     RateRequest: {
      //       Shipment: {
      //         ShipTo: {
      //           Address: {
      //             CountryCode: destination.country,
      //             PostalCode: destination.postalCode,
      //           }
      //         },
      //         Package: packageDetails,
      //       }
      //     }
      //   }),
      // });
      
      return null;
    } catch (error) {
      console.error('UPS API error:', error);
      return null;
    }
  },

  /**
   * FedEx API integration
   * Docs: https://developer.fedex.com
   */
  getFedExRate: async (
    apiKey: string,
    accountId: string,
    destination: ShippingAddress,
    packageDetails?: PackageDetails
  ): Promise<number | null> => {
    try {
      // TODO: Implement FedEx API call
      console.log('FedEx API called for:', destination.country);
      
      return null;
    } catch (error) {
      console.error('FedEx API error:', error);
      return null;
    }
  },

  /**
   * DHL API integration
   * Docs: https://developer.dhl.com
   */
  getDHLRate: async (
    apiKey: string,
    accountId: string,
    destination: ShippingAddress,
    packageDetails?: PackageDetails
  ): Promise<number | null> => {
    try {
      // TODO: Implement DHL API call
      console.log('DHL API called for:', destination.country);
      
      return null;
    } catch (error) {
      console.error('DHL API error:', error);
      return null;
    }
  },
};
