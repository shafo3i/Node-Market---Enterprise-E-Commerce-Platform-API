import { Request, Response } from 'express';
import { BrandService } from './brand.service';

export const BrandController = {
  
  getAll: async (req: Request, res: Response) => {
    try {
      const brands = await BrandService.getAll();
      res.status(200).json({ success: true, brands });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Brand ID is required' });
      }

      const brand = await BrandService.getById(id);
      res.status(200).json({ success: true, brand });
    } catch (error) {
      const status = (error as Error).message === 'Brand not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  getBySlug: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({ success: false, error: 'Brand slug is required' });
      }

      const brand = await BrandService.getBySlug(slug);
      res.status(200).json({ success: true, brand });
    } catch (error) {
      const status = (error as Error).message === 'Brand not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      // req.body already validated and sanitized by middleware
      const brand = await BrandService.create(req.body);
      res.status(201).json({ success: true, brand });
    } catch (error) {
      const status = (error as Error).message.includes('already exists') ? 409 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Brand ID is required' });
      }

      // req.body already validated and sanitized by middleware
      const brand = await BrandService.update(id, req.body);
      res.status(200).json({ success: true, brand });
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Brand not found' ? 404 
        : message.includes('already exists') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Brand ID is required' });
      }

      const result = await BrandService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Brand not found' ? 404 
        : message.includes('Cannot delete') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },
};
