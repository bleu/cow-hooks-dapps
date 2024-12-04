import { useIFrameContext } from "@bleu/cow-hooks-ui";
import type { WithdrawSchemaType } from "@bleu/utils";
import { useFormContext, useWatch } from "react-hook-form";
import { usePools } from "./usePools";
import { useSelectedPool } from "./useSelectedPool";

export function useUserPools() {
  const { context, publicClient } = useIFrameContext();
  const { control } = useFormContext<WithdrawSchemaType>();
  const poolId = useWatch({ control, name: "poolId" });
  const { data: selectedPool } = useSelectedPool(poolId);
  const usePoolsReturn = usePools(
    context?.account,
    context?.chainId,
    context?.orderParams?.sellTokenAddress,
    publicClient,
    //@ts-ignore
    context?.balancesDiff as Record<string, Record<string, string>>,
  );

  const basePools = usePoolsReturn?.data || [];
  const allPools =
    selectedPool &&
    !basePools.map((pool) => pool.address).includes(selectedPool?.address)
      ? [selectedPool, ...basePools]
      : basePools;

  return { ...usePoolsReturn, data: allPools };
}
