import { useCallback } from "react";
import useSWR from "swr";
import { isAddress } from "viem";
import { useFetchNewPoolCallback } from "./useFetchNewPoolCallback";
import { useUserPools } from "./useUserPools";

export function useSelectedPool(poolId: string) {
  const { data: pools } = useUserPools();
  const fetchNewPoolCallback = useFetchNewPoolCallback();

  const getSelectedPoolCallback = useCallback(
    async (_poolId: string) => {
      const poolsSearch = pools?.find(
        (pool) => pool.id.toLowerCase() === _poolId.toLowerCase(),
      );
      if (poolsSearch) return poolsSearch;

      if (!fetchNewPoolCallback) return;
      if (!isAddress(_poolId)) return;

      const fetchedNewPool = await fetchNewPoolCallback(_poolId);
      return fetchedNewPool;
    },
    [pools, fetchNewPoolCallback],
  );

  return useSWR(poolId, getSelectedPoolCallback);
}
