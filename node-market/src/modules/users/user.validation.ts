import { z } from "zod"

export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    image: z.string().optional(),
    phoneNumber: z.string().optional(),
    idNumber: z.string().optional(),
    idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "OTHER"]).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.string().optional(),
    idExpiryDate: z.string().optional(),
    // Admin only fields - validated by controller logic or separated schema
    role: z.enum(["USER", "ADMIN", "AGENT"]).optional(),
    status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED", "BANNED"]).optional(),
    notificationTx: z.boolean().optional(),
    notificationSecurity: z.boolean().optional(),
    notificationPromo: z.boolean().optional(),
    verificationStatus: z.enum(["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED"]).optional(),
})

export type UserUpdateInputType = z.infer<typeof updateUserSchema>;
