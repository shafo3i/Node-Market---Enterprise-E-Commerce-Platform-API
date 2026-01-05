import { prisma } from "../../config/prisma";
import { OrderStatus } from "../../generated/prisma/enums";

export const RefundsService = {
    //get all refunds
    getAllRefunds: async () => {
        const refunds = await prisma.order.findMany({
            where: {
                status: {
                    in: [OrderStatus.REFUNDED, OrderStatus.REFUND_PENDING]
                }
            }
        })
        return refunds
    },

    //get refund by id
    getRefundById: async (id: string) => {
        const refund = await prisma.order.findUnique({ where: { id } })
        return refund
    },

    //update refund status
    updateRefundStatus: async (id: string, status: OrderStatus) => {
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
                    performedBy: "SYSTEM",
                    createdAt: new Date(),
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
    updateRefundAmount: async (id: string, amount: number) => {
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
                    performedBy: "SYSTEM",
                    createdAt: new Date(),
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
    updateRefundReferenceCode: async (id: string, OrderReference: string) => {
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
                    performedBy: "SYSTEM",
                    createdAt: new Date(),
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

