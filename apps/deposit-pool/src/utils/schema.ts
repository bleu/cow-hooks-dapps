import { z } from "zod";

export const depositSchema = z.object({
  poolId: z.string(),
});
