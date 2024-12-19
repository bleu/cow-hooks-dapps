import { useBalancerPools, useIFrameContext } from "@bleu/cow-hooks-ui";
import type { Address } from "viem";

export function useTokenBuyPools() {
  const { context } = useIFrameContext();

  return useBalancerPools(
    {
      poolTypeIn: ["COW_AMM"],
      tokensIn: context?.orderParams?.buyTokenAddress
        ? [context.orderParams.buyTokenAddress as Address]
        : [],
    },
    context?.chainId,
    "totalLiquidity",
  );
}
