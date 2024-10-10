"use client";

import { Form } from "@bleu/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PoolBalancesPreview } from "#/components/PoolBalancePreview";
import { WithdrawPctSlider } from "#/components/WithdrawPctSlider";
import { withdrawSchema } from "#/utils/schema";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import {
  IMinimalPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useUserPoolContext } from "#/context/userPools";
import { useRouter } from "next/navigation";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { decodeHookCallData } from "#/utils/decodeHookCalldata";
import { SubmitButton } from "#/components/SubmitButton";

export default function Page() {
  const { context, setHookInfo, publicClient } = useIFrameContext();
  const {
    userPoolSwr: { data: pools, isLoading: isLoadingPools },
  } = useUserPoolContext();

  const form = useForm<typeof withdrawSchema._type>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const router = useRouter();

  const { setValue, control, handleSubmit } = form;

  const { withdrawPct, poolId } = useWatch({ control });

  useEffect(() => {
    if (!context?.hookToEdit || !context.account || !publicClient) return;
    decodeHookCallData(
      context?.hookToEdit?.hook.callData as `0x${string}`,

      publicClient,
      context.account
    ).then((data) => {
      if (!data) return;
      setValue("poolId", data.poolId);
      setValue("withdrawPct", data.withdrawPct);
    });
  }, [context?.hookToEdit]);

  const selectedPool = useMemo(() => {
    return pools?.find(
      (pool) => pool.id.toLowerCase() === poolId?.toLowerCase()
    );
  }, [pools, poolId]);

  const getHooksTransactions = useGetHookInfo(selectedPool);

  const onSubmitCallback = useCallback(
    async (data: typeof withdrawSchema._type) => {
      const hookInfo = await getHooksTransactions(data.withdrawPct);
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [context?.account, getHooksTransactions, setHookInfo, router]
  );

  const onSubmit = useMemo(
    () => handleSubmit(onSubmitCallback),
    [onSubmitCallback, handleSubmit]
  );

  if (!context) return null;

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
  }

  if (!ALL_SUPPORTED_CHAIN_IDS.includes(context.chainId)) {
    return <span className="mt-10 text-center">Unsupported chain</span>;
  }

  if (isLoadingPools) {
    return (
      <div className="w-full text-center mt-10 p-2">
        <Spinner />
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <span className="mt-10 text-center">
        You don't have liquidity in a CoW AMM pool
      </span>
    );
  }

  console.log({ selectedPool });
  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-1 py-1 px-4"
    >
      <PoolsDropdownMenu
        onSelect={(pool: IMinimalPool) => setValue("poolId", pool.id)}
        pools={pools || []}
        selectedPool={selectedPool}
      />
      {poolId && (
        <div className="size-full flex flex-col gap-2">
          <WithdrawPctSlider withdrawPct={withdrawPct || 100} />
          <PoolBalancesPreview />
          <SubmitButton withdrawPct={withdrawPct} poolId={poolId} />
        </div>
      )}
    </Form>
  );
}
