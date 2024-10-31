import { useIFrameContext, useReadTokenContract } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { type Address, formatUnits } from "viem";

export function useSwapAmount() {
  const { context } = useIFrameContext();

  const { tokenDecimals: tokenBuyDecimals } = useReadTokenContract({
    tokenAddress: context?.orderParams?.buyTokenAddress as Address,
  });

  const { tokenDecimals: tokenSellDecimals } = useReadTokenContract({
    tokenAddress: context?.orderParams?.sellTokenAddress as Address,
  });

  const buyAmount = useMemo(() => {
    if (!context?.orderParams?.buyAmount || !tokenBuyDecimals) return;
    return formatUnits(
      BigInt(context.orderParams.buyAmount),
      tokenBuyDecimals
    ) as `${number}`;
  }, [context?.orderParams?.buyAmount, tokenBuyDecimals]);

  const sellAmount = useMemo(() => {
    if (!context?.orderParams?.sellAmount || !tokenSellDecimals) return;
    return formatUnits(
      BigInt(context.orderParams.sellAmount),
      tokenSellDecimals
    ) as `${number}`;
  }, [context?.orderParams?.sellAmount, tokenSellDecimals]);

  return {
    buyAmount,
    sellAmount,
  };
}
