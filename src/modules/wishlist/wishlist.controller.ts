import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';

export const WishlistController = {
  
  getWishlist: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const wishlistItems = await WishlistService.getWishlist(session.user.id);
      res.status(200).json({ success: true, wishlistItems });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  addToWishlist: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      const wishlistItem = await WishlistService.addToWishlist(session.user.id, productId);
      res.status(201).json({ success: true, wishlistItem });
    } catch (error) {
      const status = (error as Error).message.includes('already in wishlist') ? 409 
        : (error as Error).message.includes('not found') ? 404 
        : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  removeFromWishlist: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      const result = await WishlistService.removeFromWishlist(session.user.id, productId);
      res.status(200).json(result);
    } catch (error) {
      const status = (error as Error).message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  clearWishlist: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const result = await WishlistService.clearWishlist(session.user.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  isInWishlist: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      const result = await WishlistService.isInWishlist(session.user.id, productId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },
};
