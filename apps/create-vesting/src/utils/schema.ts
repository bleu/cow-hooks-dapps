import { isAddress } from "viem";
import { z } from "zod";

export const periodScaleOptions = ["Day", "Week", "Month"];

export const createVestingSchema = z
  .object({
    recipient: z
      .string()
      .min(1, "Address is required")
      .refine(isAddress, "Insert a valid address"),
    period: z
      .number({ message: "Invalid period" })
      .gt(0, "Period must be greater than 0"),
    periodScale: z.enum(["Day", "Week", "Month"]),
    amount: z
      .number({ message: "Invalid amount" })
      .gt(0, "Period must be greater than 0")
      .optional(),
    vestAllFromSwap: z.boolean(),
    vestAllFromAccount: z.boolean(),
  })
  .refine(
    (schema) => {
      return !(
        schema.amount === undefined &&
        !schema.vestAllFromSwap &&
        !schema.vestAllFromAccount
      );
    },
    { message: "Amount is required", path: ["amount"] },
  );

export type CreateVestingFormData = typeof createVestingSchema._type;
