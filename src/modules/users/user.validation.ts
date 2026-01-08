import { z } from "zod"

export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    image: z.string().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/).optional(),
    idNumber: z.string().regex(/^[A-Z0-9]{5,20}$/).optional(),
    idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "OTHER"]).optional(),
    idExpiryDate: z.string().optional().transform(val => {
        if (!val) return undefined;
        // If it's already a datetime, return it
        if (val.includes('T')) return val;
        // If it's just a date, convert to datetime at midnight UTC
        return new Date(val + 'T00:00:00Z').toISOString();
    }),
    // Admin only fields - validated by controller logic or separated schema
    role: z.enum(["CUSTOMER", "ADMIN", "MERCHANT"]).optional(),
    status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED", "BANNED"]).optional(),
})

export const updateNotificationPreferencesSchema = z.object({
    emailOrderUpdates: z.boolean().optional(),
    emailPromotions: z.boolean().optional(),
    emailNewsletter: z.boolean().optional(),
    pushOrderUpdates: z.boolean().optional(),
    pushFlashSales: z.boolean().optional(),
})


export const updateUserByAdminSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    image: z.string().url().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/).optional(),
    idNumber: z.string().min(5).max(50).optional(),
    idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "OTHER"]).optional(),
    idExpiryDate: z.string().optional().transform(val => {
        if (!val) return undefined;
        // If it's already a datetime, return it
        if (val.includes('T')) return val;
        // If it's just a date, convert to datetime at midnight UTC
        return new Date(val + 'T00:00:00Z').toISOString();
    }),
    // Admin-only privileged fields
    role: z.enum(["CUSTOMER", "ADMIN", "MERCHANT"]).optional(),
    status: z.enum(["ACTIVE", "DISABLED", "SUSPENDED", "BANNED"]).optional(),
});

export type UserUpdateInputType = z.infer<typeof updateUserSchema>;
