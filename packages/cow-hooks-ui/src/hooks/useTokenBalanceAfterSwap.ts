import { useMemo } from "react";
import { type Address, formatUnits } from "viem";
import { useIFrameContext } from "../context";
import { updateTokenBalanceAfterSwap } from "../utils/math";
import { useReadTokenContract } from "./useReadTokenContract";
import { useSwapAmount } from "./useSwapAmount";

export function useTokenBalanceAfterSwap(address: string) {
  const { context } = useIFrameContext();
  const { sellAmount, buyAmount } = useSwapAmount();
  const { tokenDecimals, userBalance } = useReadTokenContract({
    tokenAddress: address as Address | undefined,
  });

  return useMemo(() => {
    if (!buyAmount || !tokenDecimals) return;
    return updateTokenBalanceAfterSwap({
      userBalance: formatUnits(
        userBalance || BigInt(0),
        tokenDecimals,
      ) as `${number}`,
      tokenAddress: address as Address,
      tokenDecimals: tokenDecimals,
      sellAmount: sellAmount as `${number}`,
      buyAmount: buyAmount as `${number}`,
      tokenBuyAddress: context?.orderParams?.buyTokenAddress as Address,
      tokenSellAddress: context?.orderParams?.sellTokenAddress as Address,
    });
  }, [buyAmount, sellAmount, tokenDecimals, userBalance, context, address]);
}
