"use client";

import { Button, Form } from "@bleu/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { depositSchema } from "#/utils/schema";
import {
  BalancesPreview,
  IPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { useTokenPools } from "#/hooks/useTokenPools";
import { usePoolBalance } from "#/hooks/usePoolBalance";
import { DropdownPoolComponent } from "#/components/DropdownPoolComponent";

const PREVIEW_LABELS = ["Pool Balance", "Deposit"];

export default function Page() {
  const { context } = useIFrameContext();
  const { data: pools, isLoading: isPoolsLoading } = useTokenPools(
    context?.chainId,
    context?.orderParams?.buyTokenAddress
  );

  const form = useForm<typeof depositSchema._type>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      poolId: "",
    },
  });

  const {
    setValue,
    control,
    formState: { isSubmitting, isSubmitSuccessful },
  } = form;

  const { poolId } = useWatch({ control });

  const onSubmitCallback = useCallback(
    async (data: typeof depositSchema._type) => {
      console.log(data);
    },
    []
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback]
  );

  const { data: poolBalances, isLoading: isBalanceLoading } = usePoolBalance({
    poolId,
    chainId: context?.chainId,
  });

  if (!context)
    return (
      <div className="w-full text-center mt-10 p-2">
        <Spinner />
      </div>
    );

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet</span>;
  }

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  console.log(context.orderParams);

  if (!context?.orderParams?.buyTokenAddress) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <span>Please specify your swap order before proceeding</span>
      </div>
    );
  }

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-1 py-1 px-4"
    >
      <PoolsDropdownMenu
        onSelect={(pool: IPool) => setValue("poolId", pool.id)}
        loading={isPoolsLoading}
        PoolComponent={DropdownPoolComponent}
        pools={pools || []}
        poolsEmptyMessage="None CoW pool with the buy token was found"
      />
      {poolId && (
        <div className="size-full flex flex-col gap-2">
          <BalancesPreview
            labels={PREVIEW_LABELS}
            balancesList={
              poolBalances ? [poolBalances, poolBalances] : undefined
            }
            isLoading={isBalanceLoading}
          />
          <Button
            type="submit"
            className="my-2 rounded-xl text-lg min-h-[58px]"
            loading={isSubmitting || isSubmitSuccessful}
            loadingText="Creating hook..."
          >
            Add post-hook
          </Button>
        </div>
      )}
    </Form>
  );
}
