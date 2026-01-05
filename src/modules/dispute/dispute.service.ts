import { prisma } from "../../config/prisma";
import { ActorType } from "../../generated/prisma/enums";
import { DisputeModel } from "../../generated/prisma/models";


export const DisputeService = {
    // Get all disputes
    getAllDisputes: async () => {
        return await prisma.dispute.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
    },
    // Get dispute by id
    getDisputeById: async (id: string) => {
        return await prisma.dispute.findUnique({ where: { id } })
    },
    // Create dispute
    createDispute: async (dispute: DisputeModel) => {
        return await prisma.dispute.create({ data: dispute })
    },
    // Update dispute
    // updateDispute: async (id: string, dispute: DisputeModel,) => {
    //     return await prisma.dispute.update({ where: { id }, data: dispute })
    // },

    //update dispute with audit trail
    updateDispute: async (id: string, data: DisputeModel) => {
        const dispute = await prisma.dispute.findUnique({ where: { id } })
        if (!dispute) throw new Error("Dispute not found");
        return await prisma.$transaction([
            prisma.dispute.update({ where: { id }, data: data }),
            prisma.auditLog.create({
                data: {
                    action: "STATUS_UPDATE",
                    entityType: "ORDER",
                    entityId: id,
                    before: dispute.status,
                    after: data.status,
                    actorType: "ADMIN",
                    performedBy: `admin:${dispute.openedBy}`,

                }
            })
        ])
    },

    // Delete dispute
    // deleteDispute: async (id: string) => {
    //     return await prisma.dispute.delete({ where: { id } })
    // },

    // delete dispute with audit trail
    deleteDispute: async (id: string) => {
        const dispute = await prisma.dispute.findUnique({ where: { id } })
        if (!dispute) throw new Error("Dispute not found");
        return await prisma.$transaction([
            prisma.dispute.delete({ where: { id } }),
            prisma.auditLog.create({
                data: {
                    action: "DELETE",
                    entityType: "ORDER",
                    entityId: id,
                    actorType: "ADMIN",
                    performedBy: `admin:${dispute.openedBy}`,
                    before: { ...dispute },
                    after: {... dispute, status: "DELETED" },
                    
                }
            })
        ])
    },

    // for users 
    getDisputesByUserId: async (userId: string) => {
        return await prisma.dispute.findMany({ where: { openedBy: userId } })
    }
}