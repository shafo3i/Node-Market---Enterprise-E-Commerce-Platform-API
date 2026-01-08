import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { generateInvoice } from '../src/modules/invoices/invoice.service';
import { NotificationService } from '../src/modules/email/notification.service';

async function testInvoiceGeneration() {
  try {
    console.log('🧪 Testing invoice generation...\n');

    // Find the most recent paid order
    const order = await prisma.order.findFirst({
      where: {
        status: {
          in: ['PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      console.log('❌ No paid orders found. Please complete a purchase first.');
      return;
    }

    console.log(`📦 Found order: ${order.orderReference || order.id}`);
    console.log(`👤 Customer: ${order.user.name} (${order.user.email})`);
    console.log(`💰 Total: $${order.total}\n`);

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId: order.id }
    });

    if (existingInvoice) {
      console.log(`📄 Invoice already exists: ${existingInvoice.invoiceNumber}`);
      console.log(`   Status: ${existingInvoice.status}`);
      console.log(`   PDF: ${existingInvoice.pdfPath || 'Not generated'}\n`);

      if (existingInvoice.pdfPath) {
        console.log('📧 Sending invoice email...');
        await NotificationService.sendInvoiceEmail(existingInvoice.id);
        console.log('✅ Invoice email sent!\n');
      } else {
        console.log('⚠️  PDF not generated yet. Regenerating...\n');
        await generateInvoice(order.id);
        console.log('✅ Invoice regenerated and email sent!\n');
      }
    } else {
      console.log('📝 Generating new invoice...');
      const invoice = await generateInvoice(order.id);
      console.log(`✅ Invoice generated: ${invoice.invoiceNumber}`);
      console.log(`   PDF: ${invoice.pdfPath}`);
      console.log('✅ Invoice email sent to customer!\n');
    }

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceGeneration();
