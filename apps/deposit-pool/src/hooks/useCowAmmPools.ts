import { useIFrameContext, useBalancerPools } from "@bleu/cow-hooks-ui";

export function useCowAmmPools() {
  const { context } = useIFrameContext();

  return useBalancerPools(
    {
      poolTypeIn: ["COW_AMM"],
    },
    context?.chainId,
    "totalLiquidity"
  );
}
