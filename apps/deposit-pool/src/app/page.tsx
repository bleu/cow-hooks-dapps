"use client";

import { Button } from "@bleu/ui";

import {
  type IPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { PoolItemInfo } from "#/components/PoolItemInfo";
import { TokenAmountInputs } from "#/components/TokenAmountInputs";
import { useSelectedPool } from "#/hooks/useSelectedPool";
import { useTokenBuyPools } from "#/hooks/useTokenBuyPools";
import type { FormType } from "#/types";

export default function Page() {
  const { context } = useIFrameContext();
  const { data: pools, isLoading: isLoadingPools } = useTokenBuyPools();

  const { setValue, control } = useFormContext<FormType>();

  const { isSubmitting } = useFormState({
    control,
  });

  const [amounts, referenceTokenAddress] = useWatch({
    control,
    name: ["amounts", "referenceTokenAddress"],
  });

  const referenceAmount = useMemo(() => {
    if (!referenceTokenAddress || !amounts) return;
    return amounts[referenceTokenAddress.toLowerCase()];
  }, [amounts, referenceTokenAddress]);

  const selectedPool = useSelectedPool();

  if (!context) return null;

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
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
      />
      {selectedPool && (
        <div className="size-full flex flex-col gap-2 mt-2">
          <TokenAmountInputs pool={selectedPool} />
          <Button
            type="submit"
            className="my-2 rounded-xl text-lg min-h-[58px]"
            loading={isSubmitting}
            disabled={!referenceAmount || referenceAmount <= 0}
            loadingText="Creating hook..."
          >
            Add post-hook
          </Button>
        </div>
      )}
    </div>
  );
}
