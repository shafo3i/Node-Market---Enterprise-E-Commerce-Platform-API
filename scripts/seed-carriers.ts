/**
 * Seed script for adding example carriers with different rate configurations
 * 
 * Usage: npx ts-node scripts/seed-carriers.ts
 */

import 'dotenv/config';
import { prisma } from '../src/config/prisma';

async function main() {
  console.log('🚀 Seeding carriers...');

  // 1. Royal Mail - Flat Rate with Free Threshold
  const royalMail = await prisma.carrier.upsert({
    where: { code: 'ROYAL_MAIL' },
    update: {},
    create: {
      name: 'Royal Mail Standard',
      code: 'ROYAL_MAIL',
      description: 'Standard UK postal service',
      trackingUrl: 'https://www.royalmail.com/track-your-item#/tracking-results/{trackingNumber}',
      contactEmail: 'customer.service@royalmail.com',
      contactPhone: '+448456070950',
      estimatedDays: 3,
      isActive: true,
      rateType: 'FLAT',
      flatRate: 4.99,
      freeThreshold: 50.00, // Free shipping on orders over £50
      apiEnabled: false,
    },
  });
  console.log('✅ Created/Updated: Royal Mail (Flat Rate: £4.99, Free over £50)');

  // 2. DPD - Flat Rate Only
  const dpd = await prisma.carrier.upsert({
    where: { code: 'DPD' },
    update: {},
    create: {
      name: 'DPD Next Day',
      code: 'DPD',
      description: 'Next day delivery service',
      trackingUrl: 'https://www.dpd.co.uk/apps/tracking/?reference={trackingNumber}',
      contactEmail: 'customer.services@dpd.co.uk',
      contactPhone: '+448448239000',
      estimatedDays: 1,
      isActive: true,
      rateType: 'FLAT',
      flatRate: 7.99,
      freeThreshold: 100.00, // Free express on orders over £100
      apiEnabled: false,
    },
  });
  console.log('✅ Created/Updated: DPD (Flat Rate: £7.99, Free over £100)');

  // 3. UPS - API Integration Ready (placeholder)
  const ups = await prisma.carrier.upsert({
    where: { code: 'UPS' },
    update: {},
    create: {
      name: 'UPS International',
      code: 'UPS',
      description: 'International shipping via UPS',
      trackingUrl: 'https://www.ups.com/track?tracknum={trackingNumber}',
      contactEmail: 'support@ups.com',
      contactPhone: '+448457877877',
      estimatedDays: 5,
      isActive: true,
      rateType: 'API',
      flatRate: null,
      freeThreshold: null,
      apiProvider: 'ups',
      apiKey: null, // Add your UPS API key here
      apiAccountId: null, // Add your UPS account number here
      apiEnabled: false, // Set to true after adding credentials
    },
  });
  console.log('✅ Created/Updated: UPS (API Integration - needs credentials)');

  // 4. FedEx - API Integration Ready (placeholder)
  const fedex = await prisma.carrier.upsert({
    where: { code: 'FEDEX' },
    update: {},
    create: {
      name: 'FedEx Express',
      code: 'FEDEX',
      description: 'Express international shipping',
      trackingUrl: 'https://www.fedex.com/fedextrack/?tracknumbers={trackingNumber}',
      contactEmail: 'international@fedex.com',
      contactPhone: '+448456070800',
      estimatedDays: 3,
      isActive: true,
      rateType: 'API',
      flatRate: null,
      freeThreshold: null,
      apiProvider: 'fedex',
      apiKey: null, // Add your FedEx API key here
      apiAccountId: null, // Add your FedEx account number here
      apiEnabled: false, // Set to true after adding credentials
    },
  });
  console.log('✅ Created/Updated: FedEx (API Integration - needs credentials)');

  // 5. Parcelforce - Flat Rate
  const parcelforce = await prisma.carrier.upsert({
    where: { code: 'PARCELFORCE' },
    update: {},
    create: {
      name: 'Parcelforce Worldwide',
      code: 'PARCELFORCE',
      description: 'UK and international parcel delivery',
      trackingUrl: 'https://www.parcelforce.com/track-trace?trackNumber={trackingNumber}',
      contactEmail: 'customer.services@parcelforce.com',
      contactPhone: '+443448009500',
      estimatedDays: 7,
      isActive: true,
      rateType: 'FLAT',
      flatRate: 12.99,
      freeThreshold: null, // No free shipping
      apiEnabled: false,
    },
  });
  console.log('✅ Created/Updated: Parcelforce (Flat Rate: £12.99)');

  console.log('\n✨ Carrier seeding completed!');
  console.log('\n📋 Summary:');
  console.log('   - 3 carriers with flat rates');
  console.log('   - 2 carriers with API integration framework (needs credentials)');
  console.log('   - 2 carriers with free shipping thresholds');
  console.log('\n🔧 Next steps:');
  console.log('   1. Add API credentials in Admin > Carriers (if using UPS/FedEx)');
  console.log('   2. Test rate calculation: POST /api/shipping/calculate');
  console.log('   3. Integrate into checkout flow');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding carriers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
