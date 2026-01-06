import { prisma } from '../../config/prisma';

export const BrandService = {
  
  getAll: async () => {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return brands;
  },

  getById: async (id: string) => {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!brand) {
      throw new Error('Brand not found');
    }
    
    return brand;
  },

  getBySlug: async (slug: string) => {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!brand) {
      throw new Error('Brand not found');
    }
    
    return brand;
  },
  

  create: async (data: { name: string; slug?: string; description?: string | null; logo?: string | null }) => {
    // Check if brand with same name already exists
    const existingByName = await prisma.brand.findUnique({
      where: { name: data.name },
    });

    if (existingByName) {
      throw new Error('Brand with this name already exists');
    }

    // Check if brand with same slug already exists
    if (data.slug) {
      const existingBySlug = await prisma.brand.findUnique({
        where: { slug: data.slug },
      });

      if (existingBySlug) {
        throw new Error('Brand with this slug already exists');
      }
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: data.description || null,
        logo: data.logo || null,
      },
    });

    return brand;
  },

  update: async (id: string, data: { name?: string }) => {
    // Check if brand exists
    const existing = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Brand not found');
    }

    // If name is being updated, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.brand.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        throw new Error('Brand with this name already exists');
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data,
    });

    return brand;
  },

  delete: async (id: string) => {
    // Check if brand exists
    const existing = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      throw new Error('Brand not found');
    }

    // Prevent deletion if brand has products
    if (existing._count.products > 0) {
      throw new Error(`Cannot delete brand with ${existing._count.products} products`);
    }

    await prisma.brand.delete({
      where: { id },
    });

    return { success: true };
  },
};
