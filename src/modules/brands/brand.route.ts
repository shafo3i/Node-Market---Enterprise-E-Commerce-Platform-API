import { Router } from 'express';
import { BrandController } from './brand.controller';
import { validateCreateBrand, validateUpdateBrand } from './brand.validation';
import { isAdmin } from '../../middleware/auth-middleware';
const router = Router();

// Brand 
router.get('/', BrandController.getAll);
router.get('/slug/:slug', BrandController.getBySlug);
router.get('/:id', BrandController.getById);
// Admin routes
router.post('/', isAdmin, validateCreateBrand, BrandController.create);
router.put('/:id', isAdmin, validateUpdateBrand, BrandController.update);
router.delete('/:id', isAdmin, BrandController.delete);

export default router;
