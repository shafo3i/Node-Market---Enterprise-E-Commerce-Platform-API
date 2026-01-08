import { sendEmail, sendEmailWithAttachment } from './email.service';
import { EmailTemplates } from './email.templates';
import { prisma } from '../../config/prisma';
import path from 'path';

export const NotificationService = {
  /**
   * Send order confirmation email to customer
   */
  sendOrderConfirmation: async (orderId: string) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              emailOrderUpdates: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          shippingAddress: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if user has email order updates enabled
      if (!order.user.emailOrderUpdates) {
        console.log(`⏭️ Skipping order confirmation email - user has disabled order updates`);
        return;
      }

      const emailData: {
        orderReference: string;
        customerName: string;
        total: string;
        items: Array<{
          name: string;
          quantity: number;
          price: string;
        }>;
        shippingAddress?: {
          street: string;
          street2?: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
      } = {
        orderReference: order.orderReference || order.id.slice(0, 8),
        customerName: order.user.name,
        total: order.total.toString(),
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price.toString(),
        })),
      };

      if (order.shippingAddress) {
        emailData.shippingAddress = {
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        };
        
        if (order.shippingAddress.street2) {
          emailData.shippingAddress.street2 = order.shippingAddress.street2;
        }
      }

      await sendEmail(
        order.user.email,
        `Order Confirmation - ${emailData.orderReference}`,
        EmailTemplates.orderConfirmation(emailData)
      );

      console.log(`✅ Order confirmation email sent to ${order.user.email}`);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // Don't throw - we don't want to fail the order if email fails
    }
  },

  /**
   * Send shipping notification email to customer
   */
  sendShippingNotification: async (orderId: string) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              emailOrderUpdates: true,
            },
          },
        },
      });

      if (!order || !order.trackingNumber || !order.shippingCarrier) {
        throw new Error('Order or shipping details not found');
      }

      // Check if user has email order updates enabled
      if (!order.user.emailOrderUpdates) {
        console.log(`⏭️ Skipping shipping notification - user has disabled order updates`);
        return;
      }

      // Get carrier details for tracking URL
      const carrier = await prisma.carrier.findUnique({
        where: { code: order.shippingCarrier },
      });

      const trackingUrl = carrier?.trackingUrl
        ? carrier.trackingUrl.replace('{trackingNumber}', order.trackingNumber)
        : undefined;

      const emailData: {
        orderReference: string;
        customerName: string;
        trackingNumber: string;
        carrierName: string;
        trackingUrl?: string;
      } = {
        orderReference: order.orderReference || order.id.slice(0, 8),
        customerName: order.user.name,
        trackingNumber: order.trackingNumber,
        carrierName: carrier?.name || order.shippingCarrier,
      };

      if (trackingUrl) {
        emailData.trackingUrl = trackingUrl;
      }

      await sendEmail(
        order.user.email,
        `Your Order Has Shipped - ${emailData.orderReference}`,
        EmailTemplates.orderShipped(emailData)
      );

      console.log(`✅ Shipping notification email sent to ${order.user.email}`);
    } catch (error) {
      console.error('Error sending shipping notification email:', error);
    }
  },

  /**
   * Send order status update email to customer
   */
  sendOrderStatusUpdate: async (orderId: string, oldStatus: string, newStatus: string) => {
    try {
      // Skip notification for certain status changes to avoid spam
      const skipStatuses = ['PENDING', 'PROCESSING'];
      if (skipStatuses.includes(newStatus)) {
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              emailOrderUpdates: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if user has email order updates enabled
      if (!order.user.emailOrderUpdates) {
        console.log(`⏭️ Skipping order status update - user has disabled order updates`);
        return;
      }

      const orderReference = order.orderReference || order.id.slice(0, 8);

      await sendEmail(
        order.user.email,
        `Order Status Update - ${orderReference}`,
        EmailTemplates.orderStatusUpdate(orderReference, order.user.name, oldStatus, newStatus)
      );

      console.log(`✅ Status update email sent to ${order.user.email}`);
    } catch (error) {
      console.error('Error sending order status update email:', error);
    }
  },

  /**
   * Send low stock alert to admins
   */
  sendLowStockAlert: async (productId: string) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          name: true,
          sku: true,
          stock: true,
          lowStockThreshold: true,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Only send if stock is below threshold
      if (product.stock >= product.lowStockThreshold) {
        return;
      }

      // Get all admin emails
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true },
      });

      if (admins.length === 0) {
        console.log('No admin users found to send low stock alert');
        return;
      }

      const emailData = {
        productName: product.name,
        sku: product.sku || 'N/A',
        currentStock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
      };

      // Send to all admins
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          `⚠️ Low Stock Alert - ${product.name}`,
          EmailTemplates.lowStockAlert(emailData)
        );
      }

      console.log(`✅ Low stock alert sent to ${admins.length} admin(s)`);
    } catch (error) {
      console.error('Error sending low stock alert:', error);
    }
  },

  /**
   * Check all products for low stock and send alerts
   */
  checkAndAlertLowStock: async () => {
    try {
      // Fetch all active products and filter in code
      // (Prisma doesn't support comparing two fields directly in where clause)
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          stock: true,
          lowStockThreshold: true,
        },
      });

      const lowStockProducts = products.filter(
        product => product.stock <= product.lowStockThreshold
      );

      console.log(`Found ${lowStockProducts.length} products with low stock`);

      for (const product of lowStockProducts) {
        await NotificationService.sendLowStockAlert(product.id);
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  },

  /**
   * Send invoice email to customer with PDF attachment
   */
  sendInvoiceEmail: async (invoiceId: string) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (!invoice.pdfPath) {
        throw new Error('Invoice PDF not generated yet');
      }

      const pdfFullPath = path.join(process.cwd(), invoice.pdfPath);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .invoice-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .invoice-number {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              margin: 10px 0;
            }
            .amount {
              font-size: 32px;
              font-weight: bold;
              color: #2d3748;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice Ready</h1>
          </div>
          <div class="content">
            <p>Dear ${invoice.customerName},</p>
            <p>Thank you for your purchase! Your invoice is ready and attached to this email.</p>
            
            <div class="invoice-details">
              <div class="invoice-number">${invoice.invoiceNumber}</div>
              <p><strong>Order Reference:</strong> ${invoice.order.orderReference || invoice.orderId}</p>
              <p><strong>Date:</strong> ${new Date(invoice.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div class="amount">$${invoice.total.toFixed(2)}</div>
            </div>

            <p>The invoice PDF is attached to this email. You can also download it anytime from your order history.</p>

            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>

            <div class="footer">
              <p><strong>Thank you for your business!</strong></p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmailWithAttachment(
        invoice.order.user.email,
        `Invoice ${invoice.invoiceNumber} - Your Purchase`,
        html,
        [
          {
            filename: `${invoice.invoiceNumber}.pdf`,
            path: pdfFullPath,
          },
        ]
      );

      // Update invoice status to SENT
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log(`✅ Invoice email sent to ${invoice.order.user.email}`);
    } catch (error) {
      console.error('Invoice email error:', error);
      throw error;
    }
  },
};
