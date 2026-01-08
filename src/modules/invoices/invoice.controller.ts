import { Request, Response } from 'express';
import { 
  generateInvoice,
  getInvoiceById,
  getUserInvoices,
  getAllInvoices,
  getInvoiceByOrderId,
  updateInvoiceStatus,
  markInvoiceViewed,
  regenerateInvoicePDF,
} from './invoice.service';
import {
  generateInvoiceSchema,
  getInvoiceSchema,
  updateInvoiceStatusSchema,
  regenerateInvoiceSchema,
} from './invoice.validation';
import path from 'path';
import fs from 'fs/promises';

/**
 * Generate invoice for an order
 * SECURITY: User can only generate invoice for their own orders
 */
export async function createInvoice(req: Request, res: Response) {
  try {
    const session = res.locals.session;
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = generateInvoiceSchema.parse(req.body);
    const invoice = await generateInvoice(orderId);
    
    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Create invoice error:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Get user's own invoices
 * SECURITY: Only returns invoices for authenticated user
 */
export async function getMyInvoices(req: Request, res: Response) {
  try {
    const session = res.locals.session;
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const invoices = await getUserInvoices(session.user.id);
    
    res.json(invoices);
  } catch (error: any) {
    console.error('Get my invoices error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get invoice by ID
 * SECURITY: Verifies user owns the invoice
 */
export async function getInvoice(req: Request, res: Response) {
  try {
    const session = res.locals.session;
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { invoiceId } = getInvoiceSchema.parse({ invoiceId: req.params.id });
    const isAdmin = session.user.role === 'ADMIN';

    const invoice = await getInvoiceById(invoiceId, session.user.id, isAdmin);
    
    res.json(invoice);
  } catch (error: any) {
    console.error('Get invoice error:', error);
    if (error.message === 'Unauthorized access to invoice') {
      return res.status(403).json({ error: error.message });
    }
    res.status(404).json({ error: error.message });
  }
}

/**
 * Get invoice by order ID
 * SECURITY: Verifies user owns the order
 */
export async function getInvoiceByOrder(req: Request, res: Response) {
  try {
    const session = res.locals.session;
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const isAdmin = session.user.role === 'ADMIN';

    const invoice = await getInvoiceByOrderId(orderId, session.user.id, isAdmin);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error: any) {
    console.error('Get invoice by order error:', error);
    if (error.message === 'Unauthorized access to invoice') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Download invoice PDF
 * SECURITY: Verifies user owns the invoice before allowing download
 */
export async function downloadInvoice(req: Request, res: Response) {
  try {
    const session = res.locals.session;
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { invoiceId } = getInvoiceSchema.parse({ invoiceId: req.params.id });
    const isAdmin = session.user.role === 'ADMIN';

    // SECURITY: Verify ownership
    const invoice = await getInvoiceById(invoiceId, session.user.id, isAdmin);

    if (!invoice.pdfPath) {
      return res.status(404).json({ error: 'PDF not generated yet' });
    }

    // Mark as viewed if not already
    if (!isAdmin) {
      await markInvoiceViewed(invoiceId, session.user.id).catch(console.error);
    }

    // SECURITY: Serve file only after ownership verification
    const filepath = path.join(process.cwd(), invoice.pdfPath);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.download(filepath, `${invoice.invoiceNumber}.pdf`);
  } catch (error: any) {
    console.error('Download invoice error:', error);
    if (error.message === 'Unauthorized access to invoice') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all invoices (Admin only)
 * SECURITY: Protected by isAdmin middleware
 */
export async function getAllInvoicesAdmin(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getAllInvoices(page, limit);
    
    res.json(result);
  } catch (error: any) {
    console.error('Get all invoices error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update invoice status (Admin only)
 * SECURITY: Protected by isAdmin middleware
 */
export async function updateStatus(req: Request, res: Response) {
  try {
    const { invoiceId, status } = updateInvoiceStatusSchema.parse({
      invoiceId: req.params.id,
      ...req.body,
    });

    const invoice = await updateInvoiceStatus(invoiceId, status as any);
    
    res.json(invoice);
  } catch (error: any) {
    console.error('Update invoice status error:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Regenerate invoice PDF (Admin only)
 * SECURITY: Protected by isAdmin middleware
 */
export async function regeneratePDF(req: Request, res: Response) {
  try {
    const { invoiceId, notes } = regenerateInvoiceSchema.parse({
      invoiceId: req.params.id,
      ...req.body,
    });

    const invoice = await regenerateInvoicePDF(invoiceId, notes);
    
    res.json(invoice);
  } catch (error: any) {
    console.error('Regenerate PDF error:', error);
    res.status(400).json({ error: error.message });
  }
}
