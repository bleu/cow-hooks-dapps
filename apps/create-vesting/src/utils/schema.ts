import { z } from "zod";
import { isAddress } from "viem";

export const periodScaleOptions = ["Day", "Week", "Month"];

const refinePeriodScale = (value: string) => {
  return periodScaleOptions.includes(value);
};

export const createVestingSchema = z.object({
  recipient: z
    .string()
    .min(1, "Address is required")
    .refine(isAddress, "Insert a valid Ethereum address"),
  period: z
    .number({ message: "Invalid amount" })
    .gt(0, "Period must be greater than 0"),
  periodScale: z
    .string()
    .refine(refinePeriodScale, "Scale must be one of the options"),
  amount: z
    .number({ message: "Invalid amount" })
    .gt(0, "Amount must be greater than 0"),
});
