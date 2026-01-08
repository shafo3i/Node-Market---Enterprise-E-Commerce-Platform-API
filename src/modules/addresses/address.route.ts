import { Router } from 'express';
import { AddressController } from './address.controller';
import { isAuthenticated, isAdmin } from '../../middleware/auth-middleware';

const router = Router();

// ADMIN ROUTES - Admin can manage any user's addresses
router.get('/admin/all', isAdmin, AddressController.getAllAddressesForAdmin);
router.get('/admin/users/:userId', isAdmin, AddressController.getAddressesByUserId);
router.post('/admin/users/:userId', isAdmin, AddressController.createAddressForUser);
router.put('/admin/users/:userId/addresses/:addressId', isAdmin, AddressController.updateAddressForUser);
router.delete('/admin/users/:userId/addresses/:addressId', isAdmin, AddressController.deleteAddressForUser);

// USER ROUTES - Authenticated users manage their own addresses
router.get('/', isAuthenticated, AddressController.getAllAddresses);
router.get('/default', isAuthenticated, AddressController.getDefaultAddress);
router.get('/:id', isAuthenticated, AddressController.getAddress);
router.post('/', isAuthenticated, AddressController.createAddress);
router.put('/:id', isAuthenticated, AddressController.updateAddress);
router.put('/:id/set-default', isAuthenticated, AddressController.setDefaultAddress);
router.delete('/:id', isAuthenticated, AddressController.deleteAddress);

export default router;
