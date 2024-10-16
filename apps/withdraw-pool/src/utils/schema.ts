import { z } from "zod";

export const withdrawSchema = z.object({
  poolId: z.string(),
  withdrawPct: z.coerce.number().min(0).max(100),
});

export type WithdrawSchemaType = z.infer<typeof withdrawSchema>;
