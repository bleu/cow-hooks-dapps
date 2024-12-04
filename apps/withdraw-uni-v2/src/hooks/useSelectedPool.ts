import { useCallback } from "react";
import useSWR from "swr";
import { isAddress } from "viem";
import { useFetchNewPoolCallback } from "./useFetchNewPoolCallback";

export function useSelectedPool(poolId: string) {
  const fetchNewPoolCallback = useFetchNewPoolCallback();

  const getSelectedPoolCallback = useCallback(
    async (_poolId: string) => {
      if (!fetchNewPoolCallback) return;
      if (!isAddress(_poolId)) return;

      const fetchedNewPool = await fetchNewPoolCallback(_poolId);
      return fetchedNewPool;
    },
    [fetchNewPoolCallback],
  );

  return useSWR(poolId, getSelectedPoolCallback);
}
