import { useFormContext, useWatch } from "react-hook-form";
import { useTokenBuyPools } from "./useTokenBuyPools";
import { useMemo } from "react";
import { FormType } from "#/types";

export function useSelectedPool() {
  const { data: pools } = useTokenBuyPools();
  const { control } = useFormContext<FormType>();
  const poolId = useWatch({ control, name: "poolId" });
  return useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );
}
