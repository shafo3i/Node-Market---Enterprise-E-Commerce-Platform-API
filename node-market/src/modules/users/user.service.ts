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
                    before: JSON.stringify(before),
                    after: JSON.stringify(data),
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

        await prisma.$transaction([
            prisma.user.update({
                where: { id },
                data: {
                    status: "DISABLED",
                    deletedAt: new Date(),
                },
            }),
            prisma.auditLog.create({
                data: {
                    entityType: "USER",
                    entityId: id,
                    action: "SOFT_DELETE",
                    actorType: "ADMIN",
                    performedBy: `admin:${adminId}`,
                    before: { status: user.status },
                    after: { status: "DISABLED" },
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

