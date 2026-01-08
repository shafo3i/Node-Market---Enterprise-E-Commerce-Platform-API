import { prisma } from '../../config/prisma';
import { CreateAddressInput, UpdateAddressInput } from './address.validation';

export const AddressService = {
  // ADMIN: Get all addresses across all users
  getAllAddressesForAdmin: async () => {
    const addresses = await prisma.address.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
    return addresses;
  },

  // Get all addresses for a user
  getUserAddresses: async (userId: string) => {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'desc' },
      ],
    });
    return addresses;
  },

  // Get a single address by ID
  getAddressById: async (addressId: string, userId: string) => {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  },

  // Create a new address
  createAddress: async (userId: string, data: CreateAddressInput) => {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        type: data.type,
        street: data.street,
        street2: data.street2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        label: data.label ?? null,
        phoneNumber: data.phoneNumber ?? null,
        isDefault: data.isDefault ?? false,
      },
    });

    return address;
  },

  // Update an address
  updateAddress: async (addressId: string, userId: string, data: UpdateAddressInput) => {
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Address not found');
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label ?? null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.street !== undefined) updateData.street = data.street;
    if (data.street2 !== undefined) updateData.street2 = data.street2 ?? null;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber ?? null;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    const address = await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });

    return address;
  },

  // Delete an address
  deleteAddress: async (addressId: string, userId: string) => {
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Address not found');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { success: true };
  },

  // Set an address as default
  setDefaultAddress: async (addressId: string, userId: string) => {
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Address not found');
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: {
        userId,
        id: { not: addressId },
      },
      data: { isDefault: false },
    });

    // Set this one as default
    const address = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return address;
  },

  // Get default address
  getDefaultAddress: async (userId: string) => {
    const address = await prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    return address;
  },
};
