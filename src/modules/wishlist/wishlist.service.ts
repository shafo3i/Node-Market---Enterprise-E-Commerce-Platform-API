import { prisma } from '../../config/prisma';

export const WishlistService = {
  
  getWishlist: async (userId: string) => {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return wishlistItems;
  },

  addToWishlist: async (userId: string, productId: string) => {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
    });

    return wishlistItem;
  },

  removeFromWishlist: async (userId: string, productId: string) => {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!item) {
      throw new Error('Item not found in wishlist');
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    return { success: true };
  },

  clearWishlist: async (userId: string) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId },
    });

    return { success: true };
  },

  isInWishlist: async (userId: string, productId: string) => {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return { inWishlist: !!item };
  },
};
