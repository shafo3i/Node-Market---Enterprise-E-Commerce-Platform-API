import 'dotenv/config';
import { prisma } from '../src/config/prisma';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create Carriers
  console.log('📦 Creating carriers...');
  const carriers = await Promise.all([
    prisma.carrier.create({
      data: {
        name: 'Royal Mail',
        code: 'ROYAL_MAIL',
        trackingUrl: 'https://www.royalmail.com/track-your-item#/tracking-results/',
        estimatedDays: 3,
        isActive: true,
      },
    }),
    prisma.carrier.create({
      data: {
        name: 'DHL Express',
        code: 'DHL',
        trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
        estimatedDays: 2,
        isActive: true,
      },
    }),
    prisma.carrier.create({
      data: {
        name: 'FedEx',
        code: 'FEDEX',
        trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=',
        estimatedDays: 2,
        isActive: true,
      },
    }),
    prisma.carrier.create({
      data: {
        name: 'UPS',
        code: 'UPS',
        trackingUrl: 'https://www.ups.com/track?tracknum=',
        estimatedDays: 3,
        isActive: true,
      },
    }),
    prisma.carrier.create({
      data: {
        name: 'Hermes',
        code: 'HERMES',
        trackingUrl: 'https://www.myhermes.co.uk/track#/parcel/',
        estimatedDays: 4,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${carriers.length} carriers`);

  // Create Brands
  console.log('🏷️  Creating brands...');
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Apple',
        slug: 'apple',
        description: 'Premium technology and electronics',
        logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Innovative electronics and appliances',
        logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        description: 'Athletic footwear and apparel',
        logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Sports and lifestyle brand',
        logo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Sony',
        slug: 'sony',
        description: 'Electronics and entertainment',
        logo: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Dell',
        slug: 'dell',
        description: 'Computers and technology solutions',
        logo: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'HP',
        slug: 'hp',
        description: 'Computing and printing solutions',
        logo: 'https://images.unsplash.com/photo-1580985216934-c78f24bc7c24?w=400',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Canon',
        slug: 'canon',
        description: 'Imaging and optical products',
        logo: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
      },
    }),
  ]);
  console.log(`✅ Created ${brands.length} brands`);

  // Create Categories
  console.log('📂 Creating categories...');
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',  
      description: 'Latest electronic devices and gadgets',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    },
  });

  const phonesCategory = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones and accessories',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    },
  });

  const laptopsCategory = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Powerful laptops for work and play',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel for everyone',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    },
  });

  const shoesCategory = await prisma.category.create({
    data: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for all occasions',
      image : 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
    },
  });

  const camerasCategory = await prisma.category.create({
    data: {
      name: 'Cameras',
      slug: 'cameras',
      description: 'Professional and consumer cameras',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
    },
  });

  console.log('✅ Created 6 categories');

  // Create Products
  console.log('📦 Creating products...');
  
  // Smartphones
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 14 Pro Max',
        slug: 'iphone-14-pro-max',
        description: 'The most advanced iPhone ever with Dynamic Island, 48MP camera, and A16 Bionic chip.',
        price: 1199.99,
        salePrice: 1099.99,
        sku: 'APPL-IPH14PM-256-BLK',
        stock: 45,
        lowStockThreshold: 10,
        brandId: brands[0].id,
        categoryId: phonesCategory.id,
        image: 
          'https://images.unsplash.com/photo-1678652197950-bd3f952c2b69?w=800',
        
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S23 Ultra',
        slug: 'samsung-galaxy-s23-ultra',
        description: '200MP camera, S Pen, and powerful performance in a premium design.',
        price: 1199.99,
        salePrice: 1049.99,
        sku: 'SAMS-S23U-512-PHN',
        stock: 38,
        lowStockThreshold: 10,
        brandId: brands[1].id,
        categoryId: phonesCategory.id,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
        isActive: true,
      },
    }),
    
    // Laptops
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16" M3 Max',
        slug: 'macbook-pro-16-m3-max',
        description: 'Supercharged by M3 Max chip with 48GB RAM and 1TB SSD.',
        price: 3499.99,
        sku: 'APPL-MBP16-M3MAX-1TB',
        stock: 15,
        lowStockThreshold: 5,
        brandId: brands[0].id,
        categoryId: laptopsCategory.id,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        description: 'Premium laptop with Intel i9, 32GB RAM, and stunning OLED display.',
        price: 2199.99,
        salePrice: 1899.99,
        sku: 'DELL-XPS15-I9-32GB',
        stock: 22,
        lowStockThreshold: 8,
        brandId: brands[5].id,
        categoryId: laptopsCategory.id,
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'HP Spectre x360',
        slug: 'hp-spectre-x360',
        description: '2-in-1 convertible laptop with touchscreen and stylus support.',
        price: 1599.99,
        salePrice: 1399.99,
        sku: 'HP-SPCTR-X360-16GB',
        stock: 18,
        lowStockThreshold: 5,
        brandId: brands[6].id,
        categoryId: laptopsCategory.id,
        image: 'https://images.unsplash.com/photo-1580985216934-c78f24bc7c24?w=800',
        isActive: true,
      },
    }),

    // Shoes
    prisma.product.create({
      data: {
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'Iconic sneakers with maximum cushioning and style.',
        price: 159.99,
        salePrice: 129.99,
        sku: 'NIKE-AM270-BLK-10',
        stock: 85,
        lowStockThreshold: 20,
        brandId: brands[2].id,
        categoryId: shoesCategory.id,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Adidas Ultraboost 22',
        slug: 'adidas-ultraboost-22',
        description: 'Premium running shoes with responsive Boost cushioning.',
        price: 189.99,
        salePrice: 159.99,
        sku: 'ADID-UB22-WHT-10',
        stock: 62,
        lowStockThreshold: 15,
        brandId: brands[3].id,
        categoryId: shoesCategory.id,
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Nike Jordan 1 Retro High',
        slug: 'nike-jordan-1-retro-high',
        description: 'Classic basketball sneakers with timeless design.',
        price: 179.99,
        sku: 'NIKE-J1-RED-11',
        stock: 42,
        lowStockThreshold: 10,
        brandId: brands[2].id,
        categoryId: shoesCategory.id,
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
        isActive: true,
      },
    }),

    // Cameras
    prisma.product.create({
      data: {
        name: 'Canon EOS R6 Mark II',
        slug: 'canon-eos-r6-mark-ii',
        description: 'Professional mirrorless camera with 24.2MP sensor and 4K 60p video.',
        price: 2499.99,
        salePrice: 2299.99,
        sku: 'CANN-R6M2-BODY',
        stock: 12,
        lowStockThreshold: 5,
        brandId: brands[7].id,
        categoryId: camerasCategory.id,
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sony A7 IV',
        slug: 'sony-a7-iv',
        description: 'Versatile full-frame camera with 33MP and advanced autofocus.',
        price: 2498.99,
        sku: 'SONY-A7IV-BODY',
        stock: 9,
        lowStockThreshold: 3,
        brandId: brands[4].id,
        categoryId: camerasCategory.id,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
        isActive: true,
      },
    }),

    // More Electronics
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy Tab S9',
        slug: 'samsung-galaxy-tab-s9',
        description: 'Premium Android tablet with S Pen and DeX mode.',
        price: 799.99,
        salePrice: 699.99,
        sku: 'SAMS-TABS9-256-GRY',
        stock: 28,
        lowStockThreshold: 10,
        brandId: brands[1].id,
        categoryId: electronicsCategory.id,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        description: 'Industry-leading noise canceling wireless headphones.',
        price: 399.99,
        salePrice: 349.99,
        sku: 'SONY-WH1000XM5-BLK',
        stock: 54,
        lowStockThreshold: 15,
        brandId: brands[4].id,
        categoryId: electronicsCategory.id,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Apple AirPods Pro 2',
        slug: 'apple-airpods-pro-2',
        description: 'Active Noise Cancellation, Adaptive Audio, and USB-C charging.',
        price: 249.99,
        salePrice: 229.99,
        sku: 'APPL-APPRO2-USBC',
        stock: 125,
        lowStockThreshold: 30,
        brandId: brands[0].id,
        categoryId: electronicsCategory.id,
        image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dell UltraSharp 27" 4K Monitor',
        slug: 'dell-ultrasharp-27-4k',
        description: '4K IPS monitor with USB-C connectivity and color accuracy.',
        price: 649.99,
        salePrice: 549.99,
        sku: 'DELL-U2723DE-27',
        stock: 16,
        lowStockThreshold: 5,
        brandId: brands[5].id,
        categoryId: electronicsCategory.id,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung 55" QLED 4K Smart TV',
        slug: 'samsung-55-qled-4k',
        description: 'Quantum Dot technology with stunning colors and smart features.',
        price: 899.99,
        salePrice: 749.99,
        sku: 'SAMS-QLED55-Q80C',
        stock: 24,
        lowStockThreshold: 8,
        brandId: brands[1].id,
        categoryId: electronicsCategory.id,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  console.log('🎉 Seed completed successfully!');
  console.log(`
  📊 Summary:
  - ${carriers.length} carriers
  - ${brands.length} brands
  - 6 categories (with hierarchy)
  - ${products.length} products (many with sale prices)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
