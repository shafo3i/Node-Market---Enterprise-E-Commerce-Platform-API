import { prisma } from "../../config/prisma";



export const LogsService = {

    //get all logs
    getAllLogs: async () => {
        const logs = await prisma.auditLog.findMany({
            orderBy: {
                createdAt: "desc",
            }
        })
        return logs
    },

    //get log by id
    getLogById: async (id: string) => {
        const log = await prisma.auditLog.findUnique({ where: { id } })
        return log
    },

    //delete log
    deleteLog: async (id: string) => {
        return prisma.auditLog.delete({ where: { id } })
    },
}