import { z } from "zod";

export const withdrawSchema = z.object({
  poolId: z.string(),
  withdrawPct: z.number().min(0).max(100),
});
