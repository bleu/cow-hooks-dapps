"use client";

import { Form } from "@bleu/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { decodeExitPoolHookCalldata } from "#/utils/decodeExitPoolHookCalldata";
import { PoolForm } from "#/components/PoolForm";

export default function Page() {
  const [isEditHookLoading, setIsEditHookLoading] = useState(true);
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

  const poolId = useWatch({ control, name: "poolId" });

  const loadHookInfo = useCallback(async () => {
    if (!context?.hookToEdit || !context.account || !publicClient) return;

    try {
      const data = await decodeExitPoolHookCalldata(
        context?.hookToEdit?.hook.callData as `0x${string}`,
        publicClient,
        context.account
      );
      setValue("poolId", data.poolId);
      setValue("withdrawPct", data.withdrawPct);
    } finally {
      setIsEditHookLoading(false);
    }
  }, [context?.hookToEdit]);

  useEffect(() => {
    loadHookInfo();
  }, [loadHookInfo]);

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
        You don't have liquidity in a CoW AMM pool
      </span>
    );
  }

  return (
    <Form
      {...form}
      onSubmit={handleSubmit(onSubmitCallback)}
      className="w-full flex flex-col gap-1 py-1 px-4"
    >
      <PoolsDropdownMenu
        onSelect={(pool: IMinimalPool) => setValue("poolId", pool.id)}
        pools={pools || []}
        selectedPool={selectedPool}
      />
      <PoolForm poolId={poolId} />
    </Form>
  );
}
