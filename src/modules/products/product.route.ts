import { Router } from 'express';
import { ProductController } from './product.controller';
import { validateCreateProduct, validateUpdateProduct } from './product.validation';

const router = Router();

// Product CRUD
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.get('/slug/:slug', ProductController.getBySlug);
router.post('/', validateCreateProduct, ProductController.create);
router.put('/:id', validateUpdateProduct, ProductController.update);
router.delete('/:id', ProductController.delete);

// Variant management
router.post('/:id/variants', ProductController.addVariant);
router.put('/variants/:variantId', ProductController.updateVariant);
router.delete('/variants/:variantId', ProductController.removeVariant);

export default router;
