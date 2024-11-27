import { useIFrameContext, usePools } from "@bleu/cow-hooks-ui";

export function useCowAmmPools() {
  const { context } = useIFrameContext();

  return usePools(
    {
      poolTypeIn: ["COW_AMM"],
    },
    context?.chainId,
    "totalLiquidity",
  );
}
