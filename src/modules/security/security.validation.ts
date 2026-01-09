import { z } from "zod";

export const updateDebugModeSchema = z.object({
  enabled: z
    .boolean(),
}).strict();

export type UpdateDebugModeInput = z.infer<typeof updateDebugModeSchema>;
