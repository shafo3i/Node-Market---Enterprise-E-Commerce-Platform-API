import { z } from "zod";

export const updateCacheSettingsSchema = z.object({
  enabled: z
    .boolean()
    .optional(),
  
  productCacheTTL: z
    .number()
    .int("Product cache TTL must be an integer")
    .min(1, "Product cache TTL must be at least 1 minute")
    .max(1440, "Product cache TTL must not exceed 1440 minutes (24 hours)")
    .optional(),
  
  categoryCacheTTL: z
    .number()
    .int("Category cache TTL must be an integer")
    .min(1, "Category cache TTL must be at least 1 minute")
    .max(1440, "Category cache TTL must not exceed 1440 minutes (24 hours)")
    .optional(),
  
  analyticsCacheTTL: z
    .number()
    .int("Analytics cache TTL must be an integer")
    .min(1, "Analytics cache TTL must be at least 1 minute")
    .max(1440, "Analytics cache TTL must not exceed 1440 minutes (24 hours)")
    .optional(),
}).strict();

export type UpdateCacheSettingsInput = z.infer<typeof updateCacheSettingsSchema>;
