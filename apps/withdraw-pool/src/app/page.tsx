"use client";

import { Button, Form } from "@bleu/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
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

export default function Page() {
  const { context, setHookInfo } = useIFrameContext();
  const {
    userPoolSwr: { data: pools },
  } = useUserPoolContext();

  const form = useForm<typeof withdrawSchema._type>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const router = useRouter();

  const {
    setValue,
    control,
    formState: { isSubmitting, isSubmitSuccessful },
  } = form;

  const { withdrawPct, poolId } = useWatch({ control });

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );

  const getHooksTransactions = useGetHookInfo(selectedPool);

  const buttonProps = useMemo(() => {
    if (!withdrawPct || Number(withdrawPct) === 0)
      return { disabled: true, message: "Define percentage" };
    return { disabled: false, message: "Add pre-hook" };
  }, [withdrawPct, poolId]);

  const onSubmitCallback = useCallback(
    async (data: typeof withdrawSchema._type) => {
      if (!selectedPool || !context?.account) return;
      const hookInfo = await getHooksTransactions(data.withdrawPct);
      if (!hookInfo) return;
      setHookInfo(hookInfo);
      router.push("/signing");
    },
    [selectedPool, context?.account, getHooksTransactions, setHookInfo, router]
  );

  const onSubmit = useMemo(
    () => form.handleSubmit(onSubmitCallback),
    [form, onSubmitCallback]
  );

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
          <WithdrawPctSlider />
          <PoolBalancesPreview />
          <Button
            type="submit"
            className="my-2"
            disabled={buttonProps.disabled}
            loading={isSubmitting || isSubmitSuccessful}
            loadingText="Creating hook..."
          >
            {buttonProps.message}
          </Button>
        </div>
      )}
    </Form>
  );
}
