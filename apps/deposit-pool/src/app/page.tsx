"use client";

import { Button, Form } from "@bleu/ui";

import {
  BalancesPreview,
  type IMinimalPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { useUserPools } from "#/hooks/useUserPools";
import { depositSchema } from "#/utils/schema";

const PREVIEW_LABELS = ["Pool Balance", "Deposit"];

export default function Page() {
  const { context } = useIFrameContext();
  const { data: pools } = useUserPools(context?.chainId, context?.account);

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

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId],
  );

  const onSubmit = useMemo(() => form.handleSubmit(() => {}), [form]);

  const { data: poolBalances, isLoading } = useUserPoolBalance({
    poolId,
    user: context?.account,
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

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-1 py-1 px-4"
    >
      <PoolsDropdownMenu
        onSelect={(pool: IMinimalPool) => setValue("poolId", pool.id)}
        selectedPool={selectedPool}
        pools={pools || []}
      />
      {poolId && (
        <div className="size-full flex flex-col gap-2">
          <BalancesPreview
            labels={PREVIEW_LABELS}
            balancesList={
              poolBalances ? [poolBalances, poolBalances] : undefined
            }
            isLoading={isLoading}
          />
          <Button
            type="submit"
            className="my-2"
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
