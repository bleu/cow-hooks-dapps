"use client";

import {
  type IPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { COW_NATIVE_TOKEN_ADDRESS } from "@bleu/utils";
import { ALL_SUPPORTED_CHAIN_IDS, type Address } from "@cowprotocol/cow-sdk";
import { useCallback, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { PoolForm } from "#/components/PoolForm";
import { PoolItemInfo } from "#/components/PoolItemInfo";
import { useCowAmmPools } from "#/hooks/useCowAmmPools";
import { useSelectedPool } from "#/hooks/useSelectedPool";
import { useTokenBalanceAfterSwap } from "#/hooks/useTokenBalanceAfterSwap";
import type { FormType } from "#/types";
import { decodeCalldata } from "#/utils/decodeCalldata";

export default function Page() {
  const { context, publicClient } = useIFrameContext();
  const { data: pools, isLoading: isLoadingPools } = useCowAmmPools();
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);

  const { setValue, reset, control } = useFormContext<FormType>();
  const referenceTokenAddress = useWatch({
    control,
    name: "referenceTokenAddress",
  });
  const sellTokenAmountAfterSwap = useTokenBalanceAfterSwap(
    context?.orderParams?.sellTokenAddress as Address,
  );

  const selectedPool = useSelectedPool();

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
    const data = await decodeCalldata(
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
    !context?.orderParams?.buyTokenAddress ||
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

  if (isLoadingPools || sellTokenAmountAfterSwap === undefined) {
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

  if (Number(sellTokenAmountAfterSwap) < 0) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <span>Insufficient sell token amount</span>
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
      />
      {selectedPool && (
        <div className="flex flex-col justify-center mt-2 w-full">
          <PoolForm pool={selectedPool} />
        </div>
      )}
    </div>
  );
}
