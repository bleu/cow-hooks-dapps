import type { z } from "zod";
import type { withdrawSchema } from "./schema";

export interface RawTokenData {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  extensions: {
    tokens: string;
  };
}

export type WithdrawSchemaType = z.infer<typeof withdrawSchema>;

export type DepositFormType = {
  poolId: string;
  amounts: Record<string, string>;
  referenceTokenAddress: string;
};
