import { prisma } from "../../config/prisma"
import { Prisma } from "../../generated/prisma/client"
import { unlockUser } from "../useraction/user.unlock"





export const UserService = {
    // Get user by id
    getUserById: async (id: string) => {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                accounts: {
                    select: {
                        updatedAt: true,
                        providerId: true

                    }
                },

            }

        })
        return user
    },

    //update user details
    updateUser: async (id: string, data: Prisma.UserUpdateInput) => {
        const user = await prisma.user.update({ where: { id }, data })
        return user
    },

    // ------ Admins ------ //

    //for admins get all users
    getAllUsers: async () => {
        const users = await prisma.user.findMany()
        return users
    },

    //for admins update user
    // updateUserByAdmin: async (id: string, data: Prisma.UserUpdateInput) => {
    //     const user = await prisma.user.update({ where: { id }, data })
    //     return user
    // },

    updateUserByAdmin: async (
        id: string,
        data: Prisma.UserUpdateInput,
        adminId: string
    ) => {
        const before = await prisma.user.findUnique({ where: { id } });
        if (!before) throw new Error("User not found");

        const [user] = await prisma.$transaction([
            prisma.user.update({
                where: { id },
                data,
            }),
            prisma.auditLog.create({
                data: {
                    entityType: "USER",
                    entityId: id,
                    action: "ADMIN_UPDATE",
                    actorType: "ADMIN",
                    performedBy: `admin:${adminId}`,
                    // Only log fields that are being changed, exclude sensitive data
                    before: JSON.stringify({
                        ...Object.keys(data).reduce((acc, key) => {
                            if (key !== 'password' && before[key as keyof typeof before] !== undefined) {
                                acc[key] = before[key as keyof typeof before];
                            }
                            return acc;
                        }, {} as Record<string, any>)
                    }),
                    // Log what was sent for update (excluding password)
                    after: JSON.stringify({
                        ...Object.keys(data).reduce((acc, key) => {
                            if (key !== 'password') {
                                acc[key] = data[key as keyof typeof data];
                            }
                            return acc;
                        }, {} as Record<string, any>)
                    }),
                },
            }),
        ]);

        if (data.emailVerified === true) {
            await unlockUser(id);
        }

        return user;
    },


    //for admins delete user
    deleteUserByAdmin: async (id: string, adminId: string) => {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error("User not found");

        const now = new Date();
        
        await prisma.$transaction([
            prisma.user.update({
                where: { id },
                data: {
                    status: "DISABLED",
                    deletedAt: now,
                },
            }),
            prisma.auditLog.create({
                data: {
                    entityType: "USER",
                    entityId: id,
                    action: "SOFT_DELETE",
                    actorType: "ADMIN",
                    performedBy: `admin:${adminId}`,
                    before: { 
                        status: user.status,
                        deletedAt: user.deletedAt 
                    },
                    after: { 
                        status: "DISABLED",
                        deletedAt: now.toISOString()
                    },
                },
            }),
        ]);
    },


    //for admins delete user
    // deleteUserByAdmin: async (id: string) => {
    //     const user = await prisma.user.delete({ where: { id } })
    //     return user
    // },
}

