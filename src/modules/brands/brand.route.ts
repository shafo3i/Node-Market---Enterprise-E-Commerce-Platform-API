import { Router } from 'express';
import { BrandController } from './brand.controller';
import { validateCreateBrand, validateUpdateBrand } from './brand.validation';

const router = Router();

router.get('/', BrandController.getAll);
router.get('/:id', BrandController.getById);
router.post('/', validateCreateBrand, BrandController.create);
router.put('/:id', validateUpdateBrand, BrandController.update);
router.delete('/:id', BrandController.delete);

export default router;
