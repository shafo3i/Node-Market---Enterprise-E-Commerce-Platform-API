import { Router } from 'express';
import { CategoryController } from './cat.controller';
import { validateCreateCategory, validateUpdateCategory } from './cat.validation';
import { isAdmin } from '../../middleware/auth-middleware';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.get('/slug/:slug', CategoryController.getBySlug);
// Admin routes
router.post('/', isAdmin, validateCreateCategory, CategoryController.create);
router.put('/:id', isAdmin, validateUpdateCategory, CategoryController.update);
router.delete('/:id', isAdmin, CategoryController.delete);

export default router;