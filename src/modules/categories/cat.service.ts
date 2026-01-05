import { prisma } from '../../config/prisma';

export const CategoryService = {
  
  getAll: async () => {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return categories;
  },

  getById: async (id: string) => {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  },

  getBySlug: async (slug: string) => {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  },

  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  }) => {
    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
      data,
    });

    return category;
  },

  update: async (id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  }) => {
    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new Error('Category with this name already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return category;
  },

  delete: async (id: string) => {
    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    // Prevent deletion if category has products
    if (existing._count.products > 0) {
      throw new Error(`Cannot delete category with ${existing._count.products} products`);
    }

    await prisma.category.delete({
      where: { id },
    });

    return { success: true };
  },
};
