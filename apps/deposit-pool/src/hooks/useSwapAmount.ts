import { useIFrameContext, useReadTokenContract } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { type Address, formatUnits } from "viem";

export function useSwapAmount(): `${number}` | undefined {
  const { context } = useIFrameContext();

  const { tokenDecimals } = useReadTokenContract({
    tokenAddress: context?.orderParams?.buyTokenAddress as Address,
  });

  return useMemo(() => {
    if (!context?.orderParams?.buyAmount || !tokenDecimals) return;
    return formatUnits(
      BigInt(context.orderParams.buyAmount),
      tokenDecimals,
    ) as `${number}`;
  }, [context?.orderParams?.buyAmount, tokenDecimals]);
}
