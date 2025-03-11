"use client";

import {
  type HookDappContextAdjusted,
  type IPool,
  PoolsDropdownMenu,
  Spinner,
  combineTokenLists,
  getUniswapV2PoolLink,
  useFetchNewUniV2PoolCallback,
  useIFrameContext,
  useSelectedPool,
  useUserUniV2Pools,
} from "@bleu/cow-hooks-ui";
import {
  COW_NATIVE_TOKEN_ADDRESS,
  type DepositFormType,
  decodeDepositCalldata,
} from "@bleu/utils";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { PoolForm } from "#/components/PoolForm";
import { PoolItemInfo } from "#/components/PoolItemInfo";

export default function Page() {
  const { context: iFrameContext, publicClient } = useIFrameContext();
  const [context, setContext] = useState<HookDappContextAdjusted | undefined>();

  // Avoid reloading the page when orderParams becomes null (waiting for new quote)
  useEffect(() => {
    const newContext = iFrameContext?.orderParams
      ? iFrameContext
      : {
          ...(iFrameContext as HookDappContextAdjusted),
          orderParams: context?.orderParams ?? null,
        };
    if (JSON.stringify(newContext) !== JSON.stringify(context))
      setContext(newContext);
  }, [iFrameContext, context]);

  const {
    data: pools,
    isLoading: isLoadingPools,
    mutate,
  } = useUserUniV2Pools();
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);

  const { setValue, reset, control } = useFormContext<DepositFormType>();
  const referenceTokenAddress = useWatch({
    control,
    name: "referenceTokenAddress",
  });

  const selectedPool = useSelectedPool();
  const fetchNewPoolCallback = useFetchNewUniV2PoolCallback();

  const allPools = useMemo(() => {
    if (!pools && !selectedPool) return [];
    if (!selectedPool) return pools || [];
    if (!pools) return [selectedPool];
    return [...pools, selectedPool].filter((item, index, array) => {
      return (
        index ===
        array.findIndex((obj) => obj.id.toLowerCase() === item.id.toLowerCase())
      );
    });
  }, [pools, selectedPool]);

  const loadHookInfo = useCallback(async () => {
    if (
      !context?.hookToEdit?.hook.callData ||
      !context.account ||
      !isEditHookLoading ||
      !publicClient ||
      referenceTokenAddress
    )
      return;
    const data = await decodeDepositCalldata(
      context?.hookToEdit.hook.callData as `0x${string}`,
      publicClient,
    );
    if (data) {
      reset(data, {
        keepDefaultValues: false,
      });
      setIsEditHookLoading(false);
    }
  }, [
    context?.hookToEdit,
    context?.account,
    reset,
    isEditHookLoading,
    publicClient,
    referenceTokenAddress,
  ]);

  if (!context)
    return (
      <div className="text-center mt-10 p-2">
        <Spinner
          size="lg"
          style={{
            width: "25px",
            height: "25px",
            color: "gray",
            animation: "spin 2s linear infinite",
          }}
        />
      </div>
    );

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
  }

  if (context?.account && context?.hookToEdit && isEditHookLoading) {
    loadHookInfo();
  }

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  if (
    !context?.orderParams?.buyTokenAddress ||
    !context?.orderParams?.sellTokenAddress ||
    !context?.orderParams?.sellAmount ||
    !context?.orderParams?.buyAmount
  ) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <span>Please specify your swap order first</span>
      </div>
    );
  }

  if (
    context?.orderParams?.buyTokenAddress.toLowerCase() ===
    COW_NATIVE_TOKEN_ADDRESS
  ) {
    return (
      <span className="block w-full mt-10 text-center">
        Deposit native token is not supported
      </span>
    );
  }

  if (isLoadingPools) {
    return (
      <div className="text-center mt-10 p-2">
        <Spinner
          size="lg"
          style={{
            width: "25px",
            height: "25px",
            color: "gray",
            animation: "spin 2s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col py-1 px-4">
      <PoolsDropdownMenu
        onSelect={(pool: IPool) => setValue("poolId", pool.id)}
        PoolItemInfo={PoolItemInfo}
        pools={allPools}
        selectedPool={selectedPool}
        isCheckDetailsCentered={false}
        getPoolLink={getUniswapV2PoolLink}
        onFetchNewPoolSuccess={(pool: IPool | undefined) => {
          if (!pool) return;
          const chainId = context.chainId;
          const poolWithChainId = { ...pool, chainId };
          const poolsWithChainId = pools?.map((p) => ({ ...p, chainId })) || [];
          mutate(combineTokenLists([poolWithChainId], poolsWithChainId));
        }}
        fetchNewPoolCallback={fetchNewPoolCallback}
      />
      {selectedPool && (
        <div className="flex flex-col justify-center mt-2 w-full">
          <PoolForm pool={selectedPool} />
        </div>
      )}
    </div>
  );
}
