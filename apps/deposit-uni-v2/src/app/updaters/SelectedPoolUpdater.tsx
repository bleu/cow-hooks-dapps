import {
  selectedPoolAtom,
  useFetchNewUniV2PoolCallback,
  useUserUniV2Pools,
} from "@bleu/cow-hooks-ui";
import type { DepositFormType } from "@bleu/utils";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import type { Address } from "viem";

export function SelectedPoolUpdater() {
  const { data: pools } = useUserUniV2Pools();
  const poolId = useWatch<DepositFormType>({ name: "poolId" }) as Address;
  const setSelectedPool = useSetAtom(selectedPoolAtom);
  const fetchNewPoolCallback = useFetchNewUniV2PoolCallback(false);

  useEffect(() => {
    if (!pools || !poolId) return;
    const newSelectedPool = pools?.find(
      (pool) => pool.id.toLowerCase() === poolId.toLowerCase(),
    );
    if (newSelectedPool) {
      setSelectedPool(newSelectedPool);
      return;
    }
    if (!fetchNewPoolCallback) return;

    fetchNewPoolCallback(poolId).then((pool) => {
      if (!pool) return;
      setSelectedPool(pool);
    });
  }, [poolId, pools, setSelectedPool, fetchNewPoolCallback]);

  return null;
}
