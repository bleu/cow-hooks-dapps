import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { FormType } from "#/types";
import { useTokenBuyPools } from "./useTokenBuyPools";

export function useSelectedPool() {
  const { data: pools } = useTokenBuyPools();
  const { control } = useFormContext<FormType>();
  const poolId = useWatch({ control, name: "poolId" });
  return useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId],
  );
}
