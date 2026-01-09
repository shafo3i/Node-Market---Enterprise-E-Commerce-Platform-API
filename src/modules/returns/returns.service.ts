import { prisma } from "../../config/prisma";
import { ReturnExchangeStatus, ReturnExchangeType, OrderStatus } from "../../generated/prisma/enums";
import type { CreateReturnExchangeInput, UpdateReturnExchangeInput } from "./returns.validation";

export const ReturnsService = {
  /**
   * Get all returns and exchanges
   */
  getAll: async () => { 
    return await prisma.returnExchange.findMany({
      include: {
        order: {    
          select: {
            id: true,
            orderReference: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Get return/exchange by ID
   */
   getById: async (id: string) => {
    return await prisma.returnExchange.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: true,
          },
        },
        items: true,
      },
    });
  },

  /**
   * Get return/exchange by return number
   */
  getByReturnNumber: async (returnNumber: string) => {
    return await prisma.returnExchange.findUnique({
      where: { returnNumber },
      include: {
        order: {
          include: {
            user: true,
            items: true,
          },
        },
        items: true,
      },
    });
  },

  /**
   * Get returns/exchanges by order ID
   */
  getByOrderId: async (orderId: string) => {
    return await prisma.returnExchange.findMany({
      where: { orderId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Get returns/exchanges by status
   */
  getByStatus: async (status: ReturnExchangeStatus) => {
    return await prisma.returnExchange.findMany({
      where: { status },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Get returns/exchanges by user ID
   */
  getByUserId: async (userId: string) => {
    return await prisma.returnExchange.findMany({
      where: {
        order: {
          userId,
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderReference: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Generate unique return number (REX-YYYYMMDD-XXXXX)
   */
  generateReturnNumber: async (): Promise<string> => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Find the latest return number for today
    const latestReturn = await prisma.returnExchange.findFirst({
      where: {
        returnNumber: {
          startsWith: `REX-${dateStr}-`,
        },
      },
      orderBy: {
        returnNumber: 'desc',
      },
    });

    let sequence = 1;
    if (latestReturn) {
      const parts = latestReturn.returnNumber.split('-');
      const lastSequence = parts[2] ? parseInt(parts[2]) : 0;
      sequence = lastSequence + 1;
    }

    return `REX-${dateStr}-${sequence.toString().padStart(5, '0')}`;
  },

  /**
   * Create new return/exchange request
   */
  create: async (data: CreateReturnExchangeInput, performedBy: string) => {
    // Verify order exists and get order details
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify items belong to the order
    for (const item of data.items) {
      const orderItem = order.items.find(oi => oi.productId === item.productId);
      if (!orderItem) {
        throw new Error(`Product ${item.productId} not found in order`);
      }
      if (item.quantity > orderItem.quantity) {
        throw new Error(`Return quantity exceeds ordered quantity for product ${item.productId}`);
      }
    }

    // Generate return number
    const returnNumber = await ReturnsService.generateReturnNumber();

    // Create return/exchange
    const returnExchange = await prisma.returnExchange.create({
      data: {
        returnNumber,
        orderId: data.orderId,
        type: data.type,
        status: ReturnExchangeStatus.REQUESTED,
        reason: data.reason,
        customerComments: data.customerComments || null,
        images: data.images || [],
        refundMethod: data.refundMethod || null,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            sku: item.sku || null,
            quantity: item.quantity,
            price: item.price,
            reason: item.reason,
            condition: item.condition || null,
            exchangeProductId: item.exchangeProductId || null,
            exchangeProductName: item.exchangeProductName || null,
            exchangeProductSku: item.exchangeProductSku || null,
          })),
        },
      },
      include: {
        items: true,
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'ORDER',
        entityId: returnExchange.id,
        performedBy,
        actorType: 'ADMIN',
        before: {},
        after: returnExchange as any,
      },
    });

    return returnExchange;
  },

  /**
   * Update return/exchange
   */
  update: async (id: string, data: UpdateReturnExchangeInput, performedBy: string) => {
    const returnExchange = await prisma.returnExchange.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!returnExchange) {
      throw new Error('Return/Exchange not found');
    }

    // Update timestamps based on status changes
    const updateData: any = { ...data };
    
    if (data.status) {
      switch (data.status) {
        case ReturnExchangeStatus.APPROVED:
          updateData.approvedAt = new Date();
          // If this is a RETURN (not EXCHANGE), set order status to REFUND_PENDING
          if (returnExchange.type === ReturnExchangeType.RETURN) {
            await prisma.order.update({
              where: { id: returnExchange.orderId },
              data: { status: OrderStatus.REFUND_PENDING }
            });
          }
          break;
        case ReturnExchangeStatus.REJECTED:
          updateData.rejectedAt = new Date();
          break;
        case ReturnExchangeStatus.RECEIVED:
          updateData.receivedAt = new Date();
          break;
        case ReturnExchangeStatus.REFUNDED:
          updateData.refundedAt = new Date();
          updateData.processedAt = new Date();
          break;
        case ReturnExchangeStatus.COMPLETED:
          updateData.completedAt = new Date();
          updateData.processedAt = new Date();
          break;
      }
      
      updateData.processedBy = performedBy;
    }

    const updated = await prisma.returnExchange.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'ORDER',
        entityId: id,
        performedBy,
        actorType: 'ADMIN',
        before: returnExchange as any,
        after: updated as any,
      },
    });

    return updated;
  },

  /**
   * Delete return/exchange
   */
  delete: async (id: string, performedBy: string) => {
    const returnExchange = await prisma.returnExchange.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!returnExchange) {
      throw new Error('Return/Exchange not found');
    }

    // Only allow deletion of REQUESTED or CANCELLED status
    const allowedStatuses: ReturnExchangeStatus[] = [ReturnExchangeStatus.REQUESTED, ReturnExchangeStatus.CANCELLED];
    if (!allowedStatuses.includes(returnExchange.status)) {
      throw new Error('Cannot delete return/exchange that is being processed');
    }

    await prisma.returnExchange.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'ORDER',
        entityId: id,
        performedBy,
        actorType: 'ADMIN',
        before: returnExchange as any,
        after: {},
      },
    });

    return returnExchange;
  },

  /**
   * Get statistics
   */
  getStatistics: async () => {
    const [
      total,
      pending,
      approved,
      completed,
      returns,
      exchanges,
    ] = await Promise.all([
      prisma.returnExchange.count(),
      prisma.returnExchange.count({
        where: {
          status: {
            in: [ReturnExchangeStatus.REQUESTED, ReturnExchangeStatus.PENDING_APPROVAL],
          },
        },
      }),
      prisma.returnExchange.count({
        where: { status: ReturnExchangeStatus.APPROVED },
      }),
      prisma.returnExchange.count({
        where: { status: ReturnExchangeStatus.COMPLETED },
      }),
      prisma.returnExchange.count({
        where: { type: ReturnExchangeType.RETURN },
      }),
      prisma.returnExchange.count({
        where: { type: ReturnExchangeType.EXCHANGE },
      }),
    ]);

    return {
      total,
      pending,
      approved,
      completed,
      returns,
      exchanges,
    };
  },
};
