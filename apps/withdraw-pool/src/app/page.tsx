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
  IPool,
  PoolsDropdownMenu,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useUserPoolContext } from "#/context/userPools";
import { useRouter } from "next/navigation";
import { ALL_SUPPORTED_CHAIN_IDS } from "@cowprotocol/cow-sdk";
import { findPoolIdOnCallData } from "#/utils/decodeHookCalldata";
import { SubmitButton } from "#/components/SubmitButton";
import { DropdownPoolComponent } from "#/components/DropdownPoolComponent";

export default function Page() {
  const { context, setHookInfo } = useIFrameContext();
  const {
    userPoolSwr: { data: pools, isLoading },
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
    if (!context?.hookToEdit) return;
    const recoveredPoolId = findPoolIdOnCallData(
      context?.hookToEdit?.hook.callData as `0x${string}`
    );
    if (!recoveredPoolId) return;
    setValue("poolId", recoveredPoolId);
  }, [context?.hookToEdit]);

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );

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

  if (!context)
    return (
      <div className="w-full text-center mt-10 p-2">
        <Spinner />
      </div>
    );

  if (!context.account) {
    return <span className="mt-10 text-center">Connect your wallet first</span>;
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
        onSelect={(pool: IPool) => setValue("poolId", pool.id)}
        pools={pools || []}
        loading={isLoading}
        PoolComponent={DropdownPoolComponent}
        poolsEmptyMessage="You don't have liquidity in a CoW AMM pool"
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
