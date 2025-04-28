import { BigNumber } from "ethers";
import { parseUnits } from "viem";

export function decimalsToBigInt(
  amount: number | undefined,
  decimals: number | undefined,
) {
  if (amount === undefined || decimals === undefined) return;
  return BigNumber.from(
    parseUnits(amount.toFixed(decimals), decimals),
  ).toBigInt();
}
