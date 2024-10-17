import { useIFrameContext, usePools } from "@bleu/cow-hooks-ui";
import { Address } from "viem";

export function useTokenBuyPools() {
  const { context } = useIFrameContext();

  return usePools(
    {
      poolTypeIn: ["COW_AMM"],
      tokensIn: context?.orderParams?.buyTokenAddress
        ? [context.orderParams.buyTokenAddress as Address]
        : [],
    },
    context?.chainId,
    "totalLiquidity"
  );
}
