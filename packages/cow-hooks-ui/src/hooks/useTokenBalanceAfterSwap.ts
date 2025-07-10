import type { Address } from "viem";
import { useFormatTokenAmount } from "./useFormatTokenAmount";
import { useReadTokenContract } from "./useReadTokenContract";

export function useTokenBalanceAfterSwap(address: string) {
  const { tokenDecimals, userBalance } = useReadTokenContract({
    tokenAddress: address as Address | undefined,
  });
  const { formatted, float } = useFormatTokenAmount({
    amount: userBalance,
    decimals: tokenDecimals,
  });

  return { formatted, float };
}
