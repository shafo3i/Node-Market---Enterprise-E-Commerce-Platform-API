import { Router } from 'express';
import { CategoryController } from './cat.controller';
import { validateCreateCategory, validateUpdateCategory } from './cat.validation';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.get('/slug/:slug', CategoryController.getBySlug);
router.post('/', validateCreateCategory, CategoryController.create);
router.put('/:id', validateUpdateCategory, CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
