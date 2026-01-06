import { Request, Response } from 'express';
import { CategoryService } from './cat.service';


export const CategoryController = {
  
  // Get all categories controller
  getAll: async (req: Request, res: Response) => {
    try {
      const categories = await CategoryService.getAll();
      res.status(200).json({ success: true, categories });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Get category by ID controller
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Category ID is required' });
      }

      const category = await CategoryService.getById(id);
      res.status(200).json({ success: true, category });
    } catch (error) {
      const status = (error as Error).message === 'Category not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Get category by slug controller
  getBySlug: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({ success: false, error: 'Category slug is required' });
      }

      const category = await CategoryService.getBySlug(slug);
      res.status(200).json({ success: true, category });
    } catch (error) {
      const status = (error as Error).message === 'Category not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },
 
  // Create new category controller
  create: async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json({ success: true, category });
    } catch (error) {
      const status = (error as Error).message.includes('already exists') ? 409 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Update category controller
  update: async (req: Request, res: Response) => {
    try {
        
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Category ID is required' });
      }

      // req.body already validated and sanitized by middleware
      const category = await CategoryService.update(id, req.body);
      res.status(200).json({ success: true, category });
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Category not found' ? 404 
        : message.includes('already exists') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  // Delete category controller
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Category ID is required' });
      }

      const result = await CategoryService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Category not found' ? 404 
        : message.includes('Cannot delete') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },
};
