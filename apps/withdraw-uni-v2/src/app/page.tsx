"use client";

import {
  type IPool,
  PoolsDropdownMenu,
  Spinner,
  combineTokenLists,
  getUniswapV2PoolLink,
  useFetchNewUniV2PoolCallback,
  useIFrameContext,
  useUserUniV2Pools,
} from "@bleu/cow-hooks-ui";
import {
  type WithdrawSchemaType,
  decodeExitPoolHookCalldata,
  isChainIdSupportedByUniV2,
} from "@bleu/utils";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { PoolForm } from "#/components/PoolForm";
import { PoolItemInfo } from "#/components/PoolItemInfo";
import { useSelectedPool } from "#/hooks/useSelectedPool";

export default function Page() {
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
  const { context } = useIFrameContext();
  const {
    data: pools,
    isLoading: isLoadingPools,
    mutate,
  } = useUserUniV2Pools();

  const { setValue, control } = useFormContext<WithdrawSchemaType>();

  const poolId = useWatch({ control, name: "poolId" });

  const loadHookInfo = useCallback(async () => {
    if (!context?.hookToEdit || !context.account) return;

    try {
      const data = await decodeExitPoolHookCalldata(
        context?.hookToEdit?.hook.callData as `0x${string}`,
      );
      setValue("poolId", data.poolId);
      setValue("withdrawPct", data.withdrawPct);
    } finally {
      setIsEditHookLoading(false);
    }
  }, [context?.account, context?.hookToEdit, setValue]);

  const selectedPool = useSelectedPool(poolId);

  useEffect(() => {
    if (poolId) {
      setIsEditHookLoading(false);
      return;
    }
    loadHookInfo();
  }, [loadHookInfo, poolId]);

  const fetchNewPoolCallback = useFetchNewUniV2PoolCallback();

  if (!context) return null;

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
  }

  if (!isChainIdSupportedByUniV2(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  if (
    pools === undefined ||
    isLoadingPools ||
    (isEditHookLoading && context.hookToEdit)
  ) {
    return <LoadingPage />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <div className="w-full flex flex-col gap-1 items-center">
        <PoolsDropdownMenu
          onSelect={(pool: IPool) => {
            setValue("poolId", pool.id);
          }}
          onFetchNewPoolSuccess={(pool: IPool | undefined) => {
            if (!pool) return;
            const chainId = context.chainId;
            const poolWithChainId = { ...pool, chainId };
            const poolsWithChainId =
              pools?.map((p) => ({ ...p, chainId })) || [];
            mutate(combineTokenLists([poolWithChainId], poolsWithChainId));
          }}
          pools={pools || []}
          PoolItemInfo={PoolItemInfo}
          selectedPool={selectedPool}
          isCheckDetailsCentered
          tooltipText="Withdraw of staked liquidity or pool with low user balance are not supported"
          fetchNewPoolCallback={fetchNewPoolCallback}
          getPoolLink={getUniswapV2PoolLink}
        />
        <PoolForm selectedPool={selectedPool} />
      </div>
    </Suspense>
  );
}

function LoadingPage() {
  return (
    <div className="text-center mt-10 p-2">
      <Spinner size="xl" />
    </div>
  );
}
