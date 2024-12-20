import { useUserUniV2Pools } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";

export function useSelectedPool(poolId: string) {
  const { data: pools } = useUserUniV2Pools();
  return useMemo(() => {
    if (!pools) return;
    return pools.find((pool) => pool.id.toLowerCase() === poolId.toLowerCase());
  }, [pools, poolId]);
}
