import { z } from "zod";

export const depositSchema = z.object({
  poolId: z.string(),
  amounts: z.record(z.string(), z.number()),
  referenceTokenAddress: z.string(),
});

export type DepositSchemaType = z.infer<typeof depositSchema>;
