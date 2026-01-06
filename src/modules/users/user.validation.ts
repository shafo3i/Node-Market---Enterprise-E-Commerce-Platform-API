import { z } from "zod"

export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    image: z.string().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/).optional(),
    idNumber: z.string().regex(/^[A-Z0-9]{5,20}$/).optional(),
    idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "OTHER"]).optional(),
    country: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(100).optional(),
    address: z.string().min(5).max(500).optional(),
    postalCode: z.string().min(3).max(20).optional(),
    idExpiryDate: z.string().datetime().optional(),
    // Admin only fields - validated by controller logic or separated schema
    role: z.enum(["CUSTOMER", "ADMIN", "MERCHANT"]).optional(),
    status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED", "BANNED"]).optional(),
    // notificationTx: z.boolean().optional(),
    // notificationSecurity: z.boolean().optional(),
    // notificationPromo: z.boolean().optional(),
    // verificationStatus: z.enum(["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED"]).optional(),
})


export const updateUserByAdminSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    image: z.string().url().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/).optional(),
    idNumber: z.string().min(5).max(50).optional(),
    idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "OTHER"]).optional(),
    country: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(100).optional(),
    address: z.string().min(5).max(500).optional(),
    postalCode: z.string().min(3).max(20).optional(),
    idExpiryDate: z.string().datetime().optional(),
    // notificationTx: z.boolean().optional(),
    // notificationSecurity: z.boolean().optional(),
    // notificationPromo: z.boolean().optional(),
    // Admin-only privileged fields
    role: z.enum(["USER", "ADMIN", "AGENT"]).optional(),
    status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED", "BANNED"]).optional(),
    // verificationStatus: z.enum(["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED"]).optional(),
});

export type UserUpdateInputType = z.infer<typeof updateUserSchema>;
