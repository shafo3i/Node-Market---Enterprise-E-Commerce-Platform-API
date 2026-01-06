import { prisma } from '../../config/prisma'
import { stripe } from '../../lib/stripe/stripe.client'
import { OrderStatus } from '../../generated/prisma/enums';


export const OrdersService = {

  createOrder: async (userId: string) => {
    // Fetch user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`);
      }
    }

    // Calculate total
    const total = cart.items.reduce((sum: number, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Generate unique order reference
    const generateOrderReference = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 char alphanumeric
      return `NM-${year}${month}${day}-${random}`;
    };

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderReference: generateOrderReference(),
          total,
          status: "PENDING",
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              variantId: null,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Reduce stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  },

  createPaymentIntent: async (orderId: string) => {
    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "PENDING") {
      throw new Error("Order is not in PENDING status");
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: order.id,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: "USD",
        provider: "STRIPE",
        providerRef: paymentIntent.id,
        status: "PENDING",
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },

  markPaymentPaid: async (paymentId: string) => {
    // Fetch payment first
   const payment = await prisma.payment.findUnique({
      where: { provider_providerRef: { provider: "STRIPE", providerRef: paymentId } },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

     // Run updates in a transaction
    await prisma.$transaction([
      // 1️⃣ Update Payment
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          paidAt: new Date(),
        },
      }),

      // 2️⃣ Update Order status
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PROCESSING",
        },
      }),

      //log audit log
      prisma.auditLog.create({
        data: {
          action: "MARK_PAYMENT_PAID",
          entityType: "PAYMENT",
          entityId: payment.id,
          performedBy: "SYSTEM",
          actorType: "SYSTEM",
            before: { status: payment.status },
            after: { status: "SUCCEEDED" },
        },      }),
    ]);

   return { success: true };
    

},

  // Get user's orders
  getUserOrders: async (userId: string) => {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            city: true,
            country: true,
            postalCode: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                sku: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  },

  // Get all orders (admin)
  getAllOrders: async (limit?: number) => {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: limit }),
    });

    return orders;
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                sku: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus, performedBy: string) => {
    const checkOrderExists = await prisma.order.findUnique({ where: { id: orderId } });
    if (!checkOrderExists) {
      throw new Error("Order not found");
    }

    return await prisma.$transaction([
      // Update order status
      prisma.order.update({
        where: { id: orderId },
        data: { status: status },
      }),
      prisma.auditLog.create({
        data: {
          action: "STATUS_UPDATE",
          entityType: "ORDER",
          entityId: orderId,
          actorType: "ADMIN",
          performedBy: performedBy,
          before: { status: checkOrderExists.status },
          after: { status: status },
        }
      })
    ])
    
  },

  // Cancel order (user can cancel PENDING orders)
  cancelOrder: async (orderId: string, userId: string) => {
    // Fetch order to verify ownership and status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (order.status !== "PENDING") {
      throw new Error("Only pending orders can be cancelled");
    }

    // Restore stock in a transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Restore stock for each product
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: {
          items: true,
        },
      });

      return updated;
    });

    return cancelledOrder;
  },
  // Update shipping information
  updateShippingInfo: async (
    orderId: string,
    shippingData: { trackingNumber: string; shippingCarrier: string; status?: OrderStatus }
  ) => {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: shippingData.trackingNumber,
        shippingCarrier: shippingData.shippingCarrier,
        status: shippingData.status || OrderStatus.SHIPPED,
        shippedAt: new Date(),
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });
    return order;
  },
}