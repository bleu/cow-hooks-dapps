import { Address, formatUnits, parseUnits } from "viem";
import { useSwapAmount } from "./useSwapAmount";
import { useIFrameContext, useReadTokenContract } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { updateTokenBalanceAfterSwap } from "#/utils/math";

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
        tokenDecimals
      ) as `${number}`,
      tokenAddress: address as Address,
      tokenDecimals: tokenDecimals,
      sellAmount: sellAmount as `${number}`,
      buyAmount: buyAmount as `${number}`,
      tokenBuyAddress: context?.orderParams?.buyTokenAddress as Address,
      tokenSellAddress: context?.orderParams?.sellTokenAddress as Address,
    });
  }, [buyAmount, sellAmount, tokenDecimals, userBalance]);
}
