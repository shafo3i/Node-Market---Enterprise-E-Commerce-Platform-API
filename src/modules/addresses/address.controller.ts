import { Request, Response } from 'express';
import { AddressService } from './address.service';
import { createAddressSchema, updateAddressSchema } from './address.validation';
import { ZodError } from 'zod';

export const AddressController = {
  // ADMIN: Get all addresses across all users
  getAllAddressesForAdmin: async (req: Request, res: Response) => {
    try {
      const addresses = await AddressService.getAllAddressesForAdmin();
      res.status(200).json({ success: true, addresses });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Get all addresses for current user
  getAllAddresses: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const addresses = await AddressService.getUserAddresses(userId);
      res.status(200).json(addresses);
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // ADMIN: Get all addresses for a specific user
  getAddressesByUserId: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      const addresses = await AddressService.getUserAddresses(userId);
      res.status(200).json(addresses);
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // ADMIN: Create address for any user
  createAddressForUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      const validated = createAddressSchema.parse(req.body);
      const address = await AddressService.createAddress(userId, validated);

      res.status(201).json(address);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // ADMIN: Update any user's address
  updateAddressForUser: async (req: Request, res: Response) => {
    try {
      const { userId, addressId } = req.params;

      if (!userId || !addressId) {
        return res.status(400).json({ success: false, error: 'User ID and Address ID are required' });
      }

      const validated = updateAddressSchema.parse(req.body);
      const address = await AddressService.updateAddress(addressId, userId, validated);

      res.status(200).json(address);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      const status = (error as Error).message === 'Address not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // ADMIN: Delete any user's address
  deleteAddressForUser: async (req: Request, res: Response) => {
    try {
      const { userId, addressId } = req.params;

      if (!userId || !addressId) {
        return res.status(400).json({ success: false, error: 'User ID and Address ID are required' });
      }

      await AddressService.deleteAddress(addressId, userId);
      res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
      const status = (error as Error).message === 'Address not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Get a single address
  getAddress: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ success: false, error: 'Address ID is required' });
      }

      const address = await AddressService.getAddressById(id, userId);
      res.status(200).json({ success: true, address });
    } catch (error) {
      const status = (error as Error).message === 'Address not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Create a new address
  createAddress: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const validated = createAddressSchema.parse(req.body);
      const address = await AddressService.createAddress(userId, validated);

      res.status(201).json({ success: true, address });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },

  // Update an address
  updateAddress: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ success: false, error: 'Address ID is required' });
      }

      const validated = updateAddressSchema.parse(req.body);
      const address = await AddressService.updateAddress(id, userId, validated);

      res.status(200).json({ success: true, address });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      const status = (error as Error).message === 'Address not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Delete an address
  deleteAddress: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ success: false, error: 'Address ID is required' });
      }

      await AddressService.deleteAddress(id, userId);
      res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
      const status = (error as Error).message === 'Address not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Set default address
  setDefaultAddress: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!id) {
        return res.status(400).json({ success: false, error: 'Address ID is required' });
      }

      const address = await AddressService.setDefaultAddress(id, userId);
      res.status(200).json({ success: true, address });
    } catch (error) {
      const status = (error as Error).message === 'Address not found' ? 404 : 400;
      res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  // Get default address
  getDefaultAddress: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const address = await AddressService.getDefaultAddress(userId);
      
      if (!address) {
        return res.status(404).json({ success: false, error: 'No default address found' });
      }

      res.status(200).json({ success: true, address });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  },
};
