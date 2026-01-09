import { prisma } from "../../config/prisma";
import { OrderStatus } from "../../generated/prisma/enums";
import { stripe } from "../../lib/stripe/stripe.client";

export const RefundsService = {
    //get all refunds
    getAllRefunds: async () => {
        const refunds = await prisma.order.findMany({
            where: {
                status: {
                    in: [OrderStatus.REFUNDED, OrderStatus.REFUND_PENDING]
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return refunds
    },

    //get refund by id
    getRefundById: async (id: string) => {
        const refund = await prisma.order.findUnique({ 
            where: { id },
            include: {
                payments: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })
        return refund
    },

    //process stripe refund
    processStripeRefund: async (orderId: string, performedBy: string) => {
        // Get order with payment info
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                payments: true
            }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== OrderStatus.REFUND_PENDING) {
            throw new Error(`Order status is ${order.status}, expected REFUND_PENDING`);
        }

        // Find successful Stripe payment
        const payment = order.payments.find(p => 
            p.status === 'SUCCEEDED' && p.provider === 'STRIPE'
        );
        
        if (!payment) {
            throw new Error('No successful Stripe payment found for this order');
        }

        // Process refund with Stripe
        try {
            const refund = await stripe.refunds.create({
                payment_intent: payment.providerRef,
                reason: 'requested_by_customer',
            });

            // Update order and payment in transaction
            await prisma.$transaction([
                prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: OrderStatus.REFUNDED,
                        refundAt: new Date()
                    }
                }),
                prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'REFUNDED',
                        paidAt: null
                    }
                }),
                prisma.auditLog.create({
                    data: {
                        performedBy: performedBy,
                        action: 'REFUND_PROCESSED',
                        entityType: 'ORDER',
                        entityId: orderId,
                        actorType: 'ADMIN',
                        before: { 
                            status: order.status,
                            stripeRefundId: null 
                        },
                        after: { 
                            status: OrderStatus.REFUNDED,
                            stripeRefundId: refund.id 
                        },
                    },
                }),
            ]);

            return { success: true, refundId: refund.id };
        } catch (error: any) {
            console.error('Stripe refund error:', error);
            throw new Error(`Stripe refund failed: ${error.message}`);
        }
    },

    //update refund status
    updateRefundStatus: async (id: string, status: OrderStatus, performedBy: string) => {
        const checkOrderExists = await prisma.order.findUnique({ where: { id } })
        if (!checkOrderExists) {
            throw new Error('Order not found');
        }
        return await prisma.$transaction([
            prisma.order.update({
                where: { id },
                data: { status }
            }),
            prisma.auditLog.create({
                data: {
                    performedBy: performedBy,
                    action: "STATUS_UPDATE",
                    entityType: "ORDER",
                    entityId: id,
                    actorType: "ADMIN",
                    before: { status: checkOrderExists.status },
                    after: { status },
                },
            }),
        ])
        // const refund = await prisma.order.update({
        //     where: { id },
        //     data: { status }
        // })
        // return refund
    },

    //update refund amount
    updateRefundAmount: async (id: string, amount: number, performedBy: string) => {
        const checkOrderExists = await prisma.order.findUnique({ where: { id } })
        if (!checkOrderExists) {
            throw new Error('Order not found');
        }
        return await prisma.$transaction([
            prisma.order.update({
                where: { id },
                data: { total: amount }
            }),
            prisma.auditLog.create({
                data: {
                    performedBy: performedBy,
                    action: "AMOUNT_UPDATE",
                    entityType: "ORDER",
                    entityId: id,
                    actorType: "ADMIN",
                    before: { total: checkOrderExists.total },
                    after: { total: amount },
                },
            }),
        ])
    },
    

    //update refund reference code
    updateRefundReferenceCode: async (id: string, OrderReference: string, performedBy: string) => {
        const checkOrderExists = await prisma.order.findUnique({ where: { id } })
        if (!checkOrderExists) {
            throw new Error('Order not found');
        }
        return await prisma.$transaction([
            prisma.order.update({
                where: { id },
                data: { orderReference: OrderReference }
            }),
            prisma.auditLog.create({
                data: {
                    performedBy: performedBy,
                    action: "REFERENCE_CODE_UPDATE",
                    entityType: "ORDER",
                    entityId: id,
                    actorType: "ADMIN",
                    before: { orderReference: checkOrderExists.orderReference },
                    after: { orderReference: OrderReference },
                },
            }),
        ])
    },




}

