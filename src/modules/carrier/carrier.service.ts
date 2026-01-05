import { prisma } from "../../config/prisma";
import type { CreateCarrierInput, UpdateCarrierInput } from "./carrier.validation";

export const CarrierService = {
  async getAllCarriers() {
    return await prisma.carrier.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  },

  async getActiveCarriers() {
    return await prisma.carrier.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  },

  async getCarrierById(id: string) {
    return await prisma.carrier.findUnique({
      where: { id },
    });
  },

  async getCarrierByCode(code: string) {
    return await prisma.carrier.findUnique({
      where: { code },
    });
  },

  async createCarrier(data: CreateCarrierInput, performedBy: string) {
    // Check if carrier with this code already exists
    const existing = await prisma.carrier.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new Error('Carrier with this code already exists');
    }

    // Check if carrier with this name already exists
    const existingName = await prisma.carrier.findUnique({
      where: { name: data.name },
    });

    if (existingName) {
      throw new Error('Carrier with this name already exists');
    }

    const carrier = await prisma.carrier.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description || null,
        trackingUrl: data.trackingUrl || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        estimatedDays: data.estimatedDays || null,
        isActive: data.isActive,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'CARRIER',
        entityId: carrier.id,
        performedBy,
        actorType: 'ADMIN',
        before: {},
        after: carrier,
      },
    });

    return carrier;
  },

  async updateCarrier(id: string, data: UpdateCarrierInput, performedBy: string) {
    const carrier = await prisma.carrier.findUnique({
      where: { id },
    });

    if (!carrier) {
      throw new Error('Carrier not found');
    }

    // Check if updating name and it conflicts with another carrier
    if (data.name && data.name !== carrier.name) {
      const existingName = await prisma.carrier.findUnique({
        where: { name: data.name },
      });

      if (existingName) {
        throw new Error('Carrier with this name already exists');
      }
    }

    // Check if updating code and it conflicts with another carrier
    if (data.code && data.code !== carrier.code) {
      const existingCode = await prisma.carrier.findUnique({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new Error('Carrier with this code already exists');
      }
    }

    const updatedCarrier = await prisma.carrier.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.trackingUrl !== undefined && { trackingUrl: data.trackingUrl || null }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail || null }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone || null }),
        ...(data.estimatedDays !== undefined && { estimatedDays: data.estimatedDays || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'CARRIER',
        entityId: carrier.id,
        performedBy,
        actorType: 'ADMIN',
        before: carrier,
        after: updatedCarrier,
      },
    });

    return updatedCarrier;
  },

  async deleteCarrier(id: string, performedBy: string) {
    const carrier = await prisma.carrier.findUnique({
      where: { id },
    });

    if (!carrier) {
      throw new Error('Carrier not found');
    }

    // Check if carrier is used in any orders
    const ordersCount = await prisma.order.count({
      where: {
        shippingCarrier: carrier.code,
      },
    });

    if (ordersCount > 0) {
      throw new Error('Cannot delete carrier that is used in existing orders. Consider deactivating instead.');
    }

    const deletedCarrier = await prisma.carrier.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'CARRIER',
        entityId: carrier.id,
        performedBy,
        actorType: 'ADMIN',
        before: carrier,
        after: {},
      },
    });

    return deletedCarrier;
  },

  async toggleCarrierStatus(id: string, performedBy: string) {
    const carrier = await prisma.carrier.findUnique({
      where: { id },
    });

    if (!carrier) {
      throw new Error('Carrier not found');
    }

    const updatedCarrier = await prisma.carrier.update({
      where: { id },
      data: {
        isActive: !carrier.isActive,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'CARRIER',
        entityId: carrier.id,
        performedBy,
        actorType: 'ADMIN',
        before: carrier,
        after: updatedCarrier,
      },
    });

    return updatedCarrier;
  },
};

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
