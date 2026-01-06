import { Request, Response } from 'express';
import { CartService } from './cart.service';


export const CartController = {
  // GET /api/cart
  getCart: async (req: Request, res: Response) => {
    try {

     const session = res.locals.session;
      const cart = await CartService.getCart(session.user.id);
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // POST /api/cart/items
  addItem: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { productId, quantity } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, error: 'Valid quantity is required' });
      }

      const cart = await CartService.addItem(session.user.id, productId, quantity);
      res.status(200).json({ success: true, cart, message: 'Item added to cart' });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  // PUT /api/cart/items
  updateItemQuantity: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;
      const { productId, quantity } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ success: false, error: 'Valid quantity is required' });
      }

      const cart = await CartService.updateItemQuantity(session.user.id, productId, quantity);
      res.status(200).json({ success: true, cart, message: 'Cart updated' });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  // DELETE /api/cart/items/:productId
  removeItem: async (req: Request, res: Response) => {
    try {
         const session = res.locals.session;
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }

      const cart = await CartService.removeItem(session.user.id, productId);
      res.status(200).json({ success: true, cart, message: 'Item removed from cart' });
    } catch (error) {
      const message = (error as Error).message;
      const status = message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, error: message });
    }
  },

  // DELETE /api/cart
  clearCart: async (req: Request, res: Response) => {
    try {
      const session = res.locals.session;

      const cart = await CartService.clearCart(session.user.id);
      res.status(200).json({ success: true, cart, message: 'Cart cleared' });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },
};
