import { Router } from 'express';
import { ProductController } from './product.controller';
import { validateCreateProduct, validateUpdateProduct } from './product.validation';
import { isAdmin } from '../../middleware/auth-middleware';
const router = Router();

// Product CRUD
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.get('/slug/:slug', ProductController.getBySlug);
// Admin routes
router.post('/', isAdmin, validateCreateProduct, ProductController.create);
router.put('/:id', isAdmin, validateUpdateProduct, ProductController.update);
router.delete('/:id', isAdmin, ProductController.delete);

// Variant management routes for products
router.post('/:id/variants', isAdmin, ProductController.addVariant);
router.put('/variants/:variantId', isAdmin, ProductController.updateVariant);
router.delete('/variants/:variantId', isAdmin, ProductController.removeVariant);

export default router;
