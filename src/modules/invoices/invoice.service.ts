import {prisma} from '../../config/prisma';
import { InvoiceStatus } from '../../generated/prisma/enums';
import { generateInvoicePDF } from './invoice-pdf.service';import { NotificationService } from '../email/notification.service';import path from 'path';
import fs from 'fs/promises';

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXXX
 */
async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]!.replace(/-/g, '');
  
  // Find the highest invoice number for today
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${dateStr}`,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]!);
    sequence = lastSequence + 1;
  }

  return `INV-${dateStr}-${sequence.toString().padStart(5, '0')}`;
}

/**
 * Generate an invoice for an order
 * SECURITY: Called after order payment confirmation
 */
export async function generateInvoice(orderId: string) {
  // Fetch order with all necessary details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
      user: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check if invoice already exists
  const existingInvoice = await prisma.invoice.findUnique({
    where: { orderId },
  });

  if (existingInvoice) {
    return existingInvoice;
  }

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Calculate financial snapshot
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.product.salePrice || item.product.price) * item.quantity,
    0
  );
  const taxRate = 0; // Can be configured based on location
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Prepare billing address snapshot
  const billingAddress = order.billingAddress || order.shippingAddress;
  const billingAddressSnapshot = billingAddress ? {
    street: billingAddress.street,
    ...(billingAddress.street2 && { street2: billingAddress.street2 }),
    city: billingAddress.city,
    state: billingAddress.state,
    postalCode: billingAddress.postalCode,
    country: billingAddress.country,
  } : null;

  // Create invoice record
  const invoiceData: any = {
    invoiceNumber,
    orderId,
    subtotal,
    taxRate,
    taxAmount,
    total,
    currency: 'USD',
    customerName: order.user.name,
    customerEmail: order.user.email,
    status: InvoiceStatus.DRAFT,
    generatedAt: new Date(),
  };

  // Only add billingAddress if it exists
  if (billingAddressSnapshot) {
    invoiceData.billingAddress = billingAddressSnapshot;
  }

  const invoice = await prisma.invoice.create({
    data: invoiceData,
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
        },
      },
    },
  });

  // Generate PDF
  try {
    const pdfPath = await generateInvoicePDF(invoice);
    
    // Update invoice with PDF path
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfPath },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            shippingAddress: true,
          },
        },
      },
    });

    // Send invoice email to customer (async, non-blocking)
    NotificationService.sendInvoiceEmail(updatedInvoice.id).catch(err =>
      console.error('Failed to send invoice email:', err)
    );

    return updatedInvoice;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return invoice;
  }
}

/**
 * Get invoice by ID with ownership verification
 * SECURITY: Verifies user owns the invoice or is admin
 */
export async function getInvoiceById(invoiceId: string, userId: string, isAdmin: boolean = false) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          user: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // SECURITY: Verify ownership unless admin
  if (!isAdmin && invoice.order.userId !== userId) {
    throw new Error('Unauthorized access to invoice');
  }

  return invoice;
}

/**
 * Get all invoices for a user
 * SECURITY: Only returns invoices owned by the user
 */
export async function getUserInvoices(userId: string) {
  return await prisma.invoice.findMany({
    where: {
      order: {
        userId,
      },
    },
    include: {
      order: {
        select: {
          id: true,
          orderReference: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });
}

/**
 * Get all invoices (Admin only)
 * SECURITY: Should only be called from admin routes
 */
export async function getAllInvoices(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      skip,
      take: limit,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    }),
    prisma.invoice.count(),
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get invoice by order ID
 * SECURITY: Includes ownership verification
 */
export async function getInvoiceByOrderId(orderId: string, userId: string, isAdmin: boolean = false) {
  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          user: true,
        },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  // SECURITY: Verify ownership unless admin
  if (!isAdmin && invoice.order.userId !== userId) {
    throw new Error('Unauthorized access to invoice');
  }

  return invoice;
}

/**
 * Update invoice status
 * SECURITY: Admin only operation
 */
export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const updateData: any = { status };

  // Track timestamp based on status
  if (status === InvoiceStatus.SENT) {
    updateData.sentAt = new Date();
  } else if (status === InvoiceStatus.VIEWED) {
    updateData.viewedAt = new Date();
  } else if (status === InvoiceStatus.PAID) {
    updateData.paidAt = new Date();
  }
  
  return await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
  });
}

/**
 * Mark invoice as viewed
 * SECURITY: Called when user views invoice
 */
export async function markInvoiceViewed(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: true,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // SECURITY: Verify ownership
  if (invoice.order.userId !== userId) {
    throw new Error('Unauthorized access to invoice');
  }

  // Only update if not already viewed
  if (!invoice.viewedAt && invoice.status === InvoiceStatus.SENT) {
    return await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.VIEWED,
        viewedAt: new Date(),
      },
    });
  }

  return invoice;
}

/**
 * Regenerate invoice PDF (Admin only)
 * SECURITY: Admin only operation
 */
export async function regenerateInvoicePDF(invoiceId: string, notes?: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Delete old PDF if exists
  if (invoice.pdfPath) {
    try {
      await fs.unlink(path.join(process.cwd(), invoice.pdfPath));
    } catch (error) {
      console.error('Failed to delete old PDF:', error);
    }
  }

  // Generate new PDF
  const pdfPath = await generateInvoicePDF(invoice);

  // Update invoice
  const updateData: any = { pdfPath };
  if (notes) {
    updateData.notes = notes;
  }

  return await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
  });
}
