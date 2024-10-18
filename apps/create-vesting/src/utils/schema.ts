import { isAddress } from "viem";
import { z } from "zod";

export const periodScaleOptions = ["Day", "Week", "Month"];

const isValidRecipient = (recipient: string) => {
  // better ENS validation is performed on form submit
  return isAddress(recipient) || recipient.endsWith(".eth");
};

export const createVestingSchema = z
  .object({
    recipient: z
      .string()
      .min(1, "Recipient is required")
      .refine(isValidRecipient, "Insert a valid address or ENS name"),
    period: z
      .number({ message: "Invalid period" })
      .gt(0, "Period must be greater than 0"),
    periodScale: z.enum(["Day", "Week", "Month"]),
    amount: z
      .number({ message: "Invalid amount" })
      .gt(0, "Amount must be greater than 0")
      .optional(),
    vestAllFromSwap: z.boolean(),
    vestAllFromAccount: z.boolean(),
    vestUserInput: z.boolean(),
  })
  .refine(
    (schema) => {
      return !(schema.amount === undefined && schema.vestUserInput);
    },
    { message: "Amount is required", path: ["amount"] },
  );

export type CreateVestingFormData = typeof createVestingSchema._type;
