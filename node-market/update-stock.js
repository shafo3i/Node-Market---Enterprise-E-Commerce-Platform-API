import { prisma } from './src/config/prisma.ts';

async function updateStock() {
  try {
    // Update Apple iPhone
    const product1 = await prisma.product.update({
      where: { id: 'cmk0c3x3600007shne2ibl1hq' },
      data: { stock: 100 }
    });
    console.log('✅ Updated Apple iPhone - stock:', product1.stock);

    // Update Brum
    const product2 = await prisma.product.update({
      where: { id: 'cmk093hr30000zkhnpef8fmxn' },
      data: { stock: 100 }
    });
    console.log('✅ Updated Brum - stock:', product2.stock);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateStock();
