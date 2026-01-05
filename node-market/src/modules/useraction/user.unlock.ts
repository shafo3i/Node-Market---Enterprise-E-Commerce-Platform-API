import { prisma } from "../../config/prisma";

export const unlockUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Only unlock if verification passed
    if (
        user.emailVerified === true &&
        user.status === "DISABLED"
    ) {
        const [updatedUser] = await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { status: "ACTIVE" },
            }),
            prisma.auditLog.create({
                data: {
                    entityType: "USER",
                    entityId: userId,
                    action: "STATUS_CHANGE",
                    actorType: "SYSTEM",
                    performedBy: "system",
                    before: { status: user.status },
                    after: { status: "ACTIVE" },
                },
            }),
        ]);

        return updatedUser;
    }

    // Explicit no-op
    return user;
}
