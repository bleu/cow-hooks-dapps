import { useMemo } from "react";
import { useUserPools } from "./useUserPools";

export function useSelectedPool(poolId: string) {
  const { data: pools } = useUserPools();
  return useMemo(() => {
    if (!pools) return;
    return pools.find((pool) => pool.id.toLowerCase() === poolId.toLowerCase());
  }, [pools, poolId]);
}
