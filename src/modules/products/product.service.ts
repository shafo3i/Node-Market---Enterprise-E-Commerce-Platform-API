import { prisma } from '../../config/prisma';

export const ProductService = {
  
  getAll: async (filters?: {
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => {
    const where: any = {};

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.brandId) where.brandId = filters.brandId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        brand: true,
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    });

    return products;
  },

  getById: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        brand: true,
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  },

  getBySlug: async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        brand: true,
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  },

  create: async (data: {
    name: string;
    slug: string;
    sku?: string | null;
    description?: string | null;
    price: number;
    stock?: number;
    lowStockThreshold?: number;
    isActive?: boolean;
    brandId: string;
    categoryId: string;
    image?: string | null;
    variants?: {
      name: string;
      sku: string;
      price?: number;
      stock: number;
    }[];
  }) => {
    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new Error('Product with this name already exists');
    }

    // Check if SKU already exists (if provided)
    if (data.sku) {
      const existingBySku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingBySku) {
        throw new Error('Product with this SKU already exists');
      }
    }

    // Verify brand and category exist
    const [brand, category] = await Promise.all([
      prisma.brand.findUnique({ where: { id: data.brandId } }),
      prisma.category.findUnique({ where: { id: data.categoryId } }),
    ]);

    if (!brand) throw new Error('Brand not found');
    if (!category) throw new Error('Category not found');

    // Check for duplicate SKUs in variants
    if (data.variants && data.variants.length > 0) {
      const skus = data.variants.map(v => v.sku);
      const duplicateSku = skus.find((sku, index) => skus.indexOf(sku) !== index);
      if (duplicateSku) {
        throw new Error(`Duplicate SKU found: ${duplicateSku}`);
      }

      // Check if SKUs already exist in database
      const existingSkus = await prisma.productVariant.findMany({
        where: { sku: { in: skus } },
      });

      if (existingSkus.length > 0) {
        throw new Error(`SKU already exists: ${existingSkus[0]?.sku}`);
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku ?? null,
        description: data.description ?? null,
        price: data.price,
        stock: data.stock ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? 10,
        isActive: data.isActive ?? true,
        brandId: data.brandId,
        categoryId: data.categoryId,
        image: data.image ?? null,
        ...(data.variants && data.variants.length > 0 ? {
          variants: {
            create: data.variants,
          },
        } : {}),
      },
      include: {
        variants: true,
        brand: true,
        category: true,
      },
    });

    return product;
  },

  update: async (id: string, data: {
    name?: string;
    slug?: string;
    sku?: string | null;
    description?: string | null;
    price?: number;
    stock?: number;
    lowStockThreshold?: number;
    isActive?: boolean;
    brandId?: string;
    categoryId?: string;
    image?: string | null;
  }) => {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Product not found');
    }

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new Error('Product with this name already exists');
      }
    }

    // If SKU is being updated, check for conflicts
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new Error('Product with this SKU already exists');
      }
    }

    // Verify brand and category if being updated
    if (data.brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
      if (!brand) throw new Error('Brand not found');
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new Error('Category not found');
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        variants: true,
        brand: true,
        category: true,
      },
    });

    return product;
  },

  delete: async (id: string) => {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!existing) {
      throw new Error('Product not found');
    }

    // Prevent deletion if product has orders
    if (existing._count.orderItems > 0) {
      throw new Error(`Cannot delete product with ${existing._count.orderItems} orders`);
    }

    // Delete related data first
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return { success: true };
  },

  // Variant management
  addVariant: async (productId: string, data: {
    name: string;
    sku: string;
    price?: number;
    stock: number;
  }) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    // Check if SKU already exists
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new Error(`SKU already exists: ${data.sku}`);
    }

    const variant = await prisma.productVariant.create({
      data: {
        ...data,
        productId,
      },
    });

    return variant;
  },

  updateVariant: async (variantId: string, data: {
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
  }) => {
    const existing = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existing) {
      throw new Error('Variant not found');
    }

    // If SKU is being updated, check for conflicts
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new Error(`SKU already exists: ${data.sku}`);
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data,
    });

    return variant;
  },

  removeVariant: async (variantId: string) => {
    await prisma.productVariant.delete({ where: { id: variantId } });
    return { success: true };
  },

  // Inventory Management Functions
  
  // Get products that need restocking
  getLowStockProducts: async () => {
    // Fetch all active products and filter where stock <= lowStockThreshold
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        brand: true,
        category: true,
      },
    });

    // Filter products where stock is at or below threshold
    const lowStockProducts = allProducts.filter(
      product => product.stock <= product.lowStockThreshold
    );

    // Sort by stock level (lowest first)
    lowStockProducts.sort((a, b) => a.stock - b.stock);

    return lowStockProducts.map(product => ({
      ...product,
      stockStatus: product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      stockDeficit: Math.max(0, product.lowStockThreshold - product.stock),
    }));
  },

  // Bulk update stock for multiple products
  bulkUpdateStock: async (updates: Array<{ productId: string; quantity: number; operation: 'SET' | 'INCREMENT' | 'DECREMENT' }>, performedBy: string) => {
    const results = await prisma.$transaction(async (tx) => {
      const updateResults = [];

      for (const update of updates) {
        const product = await tx.product.findUnique({
          where: { id: update.productId },
        });

        if (!product) {
          updateResults.push({
            productId: update.productId,
            success: false,
            error: 'Product not found',
          });
          continue;
        }

        let newStock: number;
        switch (update.operation) {
          case 'SET':
            newStock = update.quantity;
            break;
          case 'INCREMENT':
            newStock = product.stock + update.quantity;
            break;
          case 'DECREMENT':
            newStock = Math.max(0, product.stock - update.quantity);
            break;
        }

        const updatedProduct = await tx.product.update({
          where: { id: update.productId },
          data: { stock: newStock },
        });

        // Log the stock change
        await tx.auditLog.create({
          data: {
            action: 'STOCK_UPDATE',
            entityType: 'PRODUCT',
            entityId: update.productId,
            performedBy: performedBy,
            actorType: 'ADMIN',
            before: { stock: product.stock },
            after: { stock: newStock, operation: update.operation, quantity: update.quantity },
          },
        });

        updateResults.push({
          productId: update.productId,
          success: true,
          previousStock: product.stock,
          newStock: newStock,
          product: updatedProduct,
        });
      }

      return updateResults;
    });

    return results;
  },

  // Get stock change history for a product
  getStockHistory: async (productId: string, limit: number = 50) => {
    const history = await prisma.auditLog.findMany({
      where: {
        entityType: 'PRODUCT',
        entityId: productId,
        action: 'STOCK_UPDATE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return history.map(log => ({
      id: log.id,
      performedBy: log.performedBy,
      actorType: log.actorType,
      previousStock: (log.before as any).stock,
      newStock: (log.after as any).stock,
      operation: (log.after as any).operation,
      quantity: (log.after as any).quantity,
      timestamp: log.createdAt,
    }));
  },

  // Get overall stock statistics
  getStockStatistics: async () => {
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        stock: true,
        lowStockThreshold: true,
      },
    });

    const totalProducts = allProducts.length;
    const outOfStock = allProducts.filter(p => p.stock === 0).length;
    const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const healthyStock = allProducts.filter(p => p.stock > p.lowStockThreshold).length;
    const totalStockUnits = allProducts.reduce((sum, p) => sum + p.stock, 0);

    return {
      totalProducts,
      outOfStock,
      lowStock,
      healthyStock,
      totalStockUnits,
      stockDistribution: {
        outOfStockPercentage: totalProducts > 0 ? ((outOfStock / totalProducts) * 100).toFixed(1) : '0.0',
        lowStockPercentage: totalProducts > 0 ? ((lowStock / totalProducts) * 100).toFixed(1) : '0.0',
        healthyStockPercentage: totalProducts > 0 ? ((healthyStock / totalProducts) * 100).toFixed(1) : '0.0',
      },
    };
  },
};
