"use client";

import {
  type IPool,
  PoolItemInfo,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import {
  type WithdrawSchemaType,
  decodeExitPoolHookCalldata,
} from "@bleu/utils";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { PoolForm } from "#/components/PoolForm";
import { useUserPools } from "#/hooks/useUserPools";

const ALL_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ARBITRUM_ONE,
];

export default function Page() {
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
  const { context } = useIFrameContext();
  const { data: pools, isLoading: isLoadingPools } = useUserPools();
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

  const selectedPool = useMemo(() => {
    return pools?.find(
      (pool) => pool.id.toLowerCase() === poolId?.toLowerCase(),
    );
  }, [pools, poolId]);

  useEffect(() => {
    if (poolId) {
      setIsEditHookLoading(false);
      return;
    }
    loadHookInfo();
  }, [loadHookInfo, poolId]);

  if (!context) return null;

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
  }

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  if (isLoadingPools || (isEditHookLoading && context.hookToEdit)) {
    return (
      <div className="text-center mt-10 p-2">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <span className="mt-10 text-center">
        You don't have unstaked liquidity in a CoW AMM pool
      </span>
    );
  }

  return (
    <div className="w-full flex flex-col gap-1 items-center">
      <PoolsDropdownMenu
        onSelect={(pool: IPool) => setValue("poolId", pool.id)}
        pools={pools || []}
        PoolItemInfo={PoolItemInfo}
        selectedPool={selectedPool}
        isCheckDetailsCentered
        tooltipText="Withdraw of staked liquidity or pool with low user balance are not supported"
      />
      <PoolForm selectedPool={selectedPool} />
    </div>
  );
}
