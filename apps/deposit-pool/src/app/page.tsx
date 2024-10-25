"use client";

import {
  type IPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PoolForm } from "#/components/PoolForm";
import { PoolItemInfo } from "#/components/PoolItemInfo";
import { useSelectedPool } from "#/hooks/useSelectedPool";
import { useTokenBuyPools } from "#/hooks/useTokenBuyPools";
import type { FormType } from "#/types";
import { decodeCalldata } from "#/utils/decodeCalldata";

export default function Page() {
  const { context } = useIFrameContext();
  const { data: pools, isLoading: isLoadingPools } = useTokenBuyPools();
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);

  const { setValue } = useFormContext<FormType>();

  const selectedPool = useSelectedPool();

  const loadHookInfo = useCallback(() => {
    if (!context?.hookToEdit || !context.account || !isEditHookLoading) return;
    const data = decodeCalldata(
      context?.hookToEdit?.hook.callData as `0x${string}`,
    );
    if (data) {
      setValue("poolId", data.poolId);
      setValue("amounts", data.amounts);
      setValue("referenceTokenAddress", data.referenceTokenAddress);
      setIsEditHookLoading(false);
    }
  }, [context?.hookToEdit, context?.account, setValue, isEditHookLoading]);

  if (!context) return null;

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
  }

  if (context?.account && context?.hookToEdit && isEditHookLoading) {
    loadHookInfo();
  }

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  if (isLoadingPools) {
    return (
      <div className="text-center mt-10 p-2">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!context?.orderParams?.buyTokenAddress) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <span>Please specify your swap order before proceeding</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col py-1 px-4">
      <PoolsDropdownMenu
        onSelect={(pool: IPool) => setValue("poolId", pool.id)}
        PoolItemInfo={PoolItemInfo}
        pools={pools || []}
        selectedPool={selectedPool}
        isCheckDetailsCentered={true}
      />
      {selectedPool && (
        <div className="flex flex-col justify-center mt-2 w-full">
          <PoolForm pool={selectedPool} />
        </div>
      )}
    </div>
  );
}
