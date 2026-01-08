import { Router } from 'express';
import {
  createInvoice,
  getMyInvoices,
  getInvoice,
  getInvoiceByOrder,
  downloadInvoice,
  getAllInvoicesAdmin,
  updateStatus,
  regeneratePDF,
} from './invoice.controller';
import { isAuthenticated, isAdmin } from '../../middleware/auth-middleware';

const router = Router();

/**
 * USER ROUTES
 * SECURITY: All routes require authentication
 * SECURITY: Ownership verification happens in service layer
 */

// Get all invoices for authenticated user
router.get('/my-invoices', isAuthenticated, getMyInvoices);

// Get specific invoice by ID (with ownership check)
router.get('/:id', isAuthenticated, getInvoice);

// Get invoice by order ID (with ownership check)
router.get('/order/:orderId', isAuthenticated, getInvoiceByOrder);

// Download invoice PDF (with ownership check)
router.get('/:id/download', isAuthenticated, downloadInvoice);

// Generate invoice for an order
router.post('/generate', isAuthenticated, createInvoice);

/**
 * ADMIN ROUTES
 * SECURITY: All admin routes use isAdmin middleware
 * SECURITY: isAdmin checks both authentication and ADMIN role
 */

// Get all invoices (admin only)
router.get('/admin/all', isAdmin, getAllInvoicesAdmin);

// Update invoice status (admin only)
router.patch('/admin/:id/status', isAdmin, updateStatus);

// Regenerate invoice PDF (admin only)
router.post('/admin/:id/regenerate', isAdmin, regeneratePDF);

export default router;
