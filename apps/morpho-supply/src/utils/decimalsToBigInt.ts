import { BigNumber } from "ethers";
import { parseUnits } from "viem";
import { formatTokenAmount } from "./formatTokenAmout";

export function decimalsToBigInt(
  amount: string | undefined,
  decimals: number | undefined,
) {
  if (amount === undefined || decimals === undefined) return;

  return BigNumber.from(
    parseUnits(
      formatTokenAmount(amount.toString(), { compact: true }),
      decimals,
    ),
  ).toBigInt();
}
