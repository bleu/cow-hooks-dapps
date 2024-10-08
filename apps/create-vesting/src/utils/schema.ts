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
    .refine(isAddress, "Insert a valid address"),
  period: z
    .number({ message: "Invalid amount" })
    .gt(0, "Period must be greater than 0"),
  periodScale: z.enum(["Day", "Week", "Month"]),
  amount: z
    .number({ message: "Invalid amount" })
    .gt(0, "Amount must be greater than 0"),
});
