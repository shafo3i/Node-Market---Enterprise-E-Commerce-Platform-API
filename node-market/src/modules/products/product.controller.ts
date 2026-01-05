import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { auth } from '../../auth'
import { fromNodeHeaders } from 'better-auth/node';

export const ProductController = {
  
  getAll: async (req: Request, res: Response) => {
    try {
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      
      const filters = {
        ...(req.query.categoryId && { categoryId: req.query.categoryId as string }),
        ...(req.query.brandId && { brandId: req.query.brandId as string }),
        ...(isActive !== undefined && { isActive }),
        ...(req.query.minPrice && { minPrice: Number(req.query.minPrice) }),
        ...(req.query.maxPrice && { maxPrice: Number(req.query.maxPrice) }),
        ...(req.query.search && { search: req.query.search as string }),
      };

      const products = await ProductService.getAll(filters);
      res.status(200).json({ success: true, products });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      const product = await ProductService.getById(id);
      res.status(200).json({ success: true, product });
    } catch (error) {
      const status = (error as Error).message === 'Product not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  getBySlug: async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({ success: false, error: 'Product slug is required' });
      }

      const product = await ProductService.getBySlug(slug);
      res.status(200).json({ success: true, product });
    } catch (error) {
      const status = (error as Error).message === 'Product not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
                // check authentication 
        const session =  await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        // Check if no session
        if(!session) {
            return  res.status(401).json( { success: false, message: "User not authenticated" } );
        }

        // Check if user is admin
        if(session.user?.role !== 'ADMIN') {
            return  res.status(403).json( { success: false, message: "User not authorized" } );
        }
      // req.body already validated and sanitized by middleware
      const product = await ProductService.create(req.body);
      res.status(201).json({ success: true, product });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('already exists') ? 409 
        : message.includes('not found') ? 404 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
                // check authentication 
        const session =  await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        // Check if no session
        if(!session) {
            return  res.status(401).json( { success: false, message: "User not authenticated" } );
        }

        // Check if user is admin
        if(session.user?.role !== 'ADMIN') {
            return  res.status(403).json( { success: false, message: "User not authorized" } );
        }

      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      // req.body already validated and sanitized by middleware
      const product = await ProductService.update(id, req.body);
      res.status(200).json({ success: true, product });
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Product not found' ? 404 
        : message.includes('already exists') ? 409 
        : message.includes('not found') ? 404
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
                // check authentication 
        const session =  await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        // Check if no session
        if(!session) {
            return  res.status(401).json( { success: false, message: "User not authenticated" } );
        }

        // Check if user is admin
        if(session.user?.role !== 'ADMIN') {
            return  res.status(403).json( { success: false, message: "User not authorized" } );
        }

      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      const result = await ProductService.delete(id);
      res.status(200).json(result);
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Product not found' ? 404 
        : message.includes('Cannot delete') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  // Variant management
  addVariant: async (req: Request, res: Response) => {
    try {
                // check authentication 
        const session =  await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        // Check if no session
        if(!session) {
            return  res.status(401).json( { success: false, message: "User not authenticated" } );
        }

        // Check if user is admin
        if(session.user?.role !== 'ADMIN') {
            return  res.status(403).json( { success: false, message: "User not authorized" } );
        }

      const { id } = req.params;
      const { name, sku, price, stock } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      if (!name || !sku || stock === undefined) {
        return res.status(400).json({ success: false, error: 'Name, SKU, and stock are required' });
      }

      const variant = await ProductService.addVariant(id, { name, sku, price, stock });
      res.status(201).json({ success: true, variant });
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Product not found' ? 404 
        : message.includes('already exists') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  updateVariant: async (req: Request, res: Response) => {
    try {
                // check authentication 
        const session =  await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        // Check if no session
        if(!session) {
            return  res.status(401).json( { success: false, message: "User not authenticated" } );
        }

        // Check if user is admin
        if(session.user?.role !== 'ADMIN') {
            return  res.status(403).json( { success: false, message: "User not authorized" } );
        }

      const { variantId } = req.params;
      const { name, sku, price, stock } = req.body;

      if (!variantId) {
        return res.status(400).json({ success: false, error: 'Variant ID is required' });
      }

      const variant = await ProductService.updateVariant(variantId, { name, sku, price, stock });
      res.status(200).json({ success: true, variant });
    } catch (error) {
      const message = (error as Error).message;
      const status = message === 'Variant not found' ? 404 
        : message.includes('already exists') ? 409 
        : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  removeVariant: async (req: Request, res: Response) => {
    try {
                // check authentication 
        const session =  await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        // Check if no session
        if(!session) {
            return  res.status(401).json( { success: false, message: "User not authenticated" } );
        }

        // Check if user is admin
        if(session.user?.role !== 'ADMIN') {
            return  res.status(403).json( { success: false, message: "User not authorized" } );
        }
        
      const { variantId } = req.params;

      if (!variantId) {
        return res.status(400).json({ success: false, error: 'Variant ID is required' });
      }

      const result = await ProductService.removeVariant(variantId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },
};
