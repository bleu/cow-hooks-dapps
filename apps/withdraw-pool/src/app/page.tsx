"use client";

import { Button, Form } from "@bleu/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PoolBalancesPreview } from "#/components/PoolBalancePreview";
import { PoolsDropdownMenu } from "#/components/PoolsDropdownMenu";
import { WithdrawPctSlider } from "#/components/WithdrawPctSlider";
import type { IMinimalPool } from "#/types";
import { withdrawSchema } from "#/utils/schema";
import { useGetHookInfo } from "#/hooks/useGetHookInfo";
import { useIFrameContext } from "#/context/iframe";
import { useRouter } from "next/navigation";
import { Spinner } from "#/components/Spinner";

export default function Page() {
  const {
    context,
    userPoolSwr: { data: pools },
    setHookInfo,
  } = useIFrameContext();
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
    formState: { isSubmitting },
  } = form;

  const { withdrawPct, poolId } = useWatch({ control });

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );

  const getHooksTransactions = useGetHookInfo(selectedPool);

  const buttonProps = useMemo(() => {
    if (!withdrawPct || withdrawPct === 0)
      return { disabled: true, message: "Define percentage" };
    return { disabled: false, message: "Add pre-hook" };
  }, [withdrawPct]);

  if (!context)
    return (
      <div className="w-full text-center p-2">
        <Spinner />
      </div>
    );

  return (
    <Form
      {...form}
      onSubmit={form.handleSubmit(async (data) => {
        if (!selectedPool || !context.account) return;
        const hookInfo = await getHooksTransactions(data.withdrawPct);
        if (!hookInfo) return;
        setHookInfo(hookInfo);
        router.push("/signing");
      })}
      className="w-full flex flex-col gap-1 py-1 px-4"
    >
      <PoolsDropdownMenu
        onSelect={(pool: IMinimalPool) => setValue("poolId", pool.id)}
        selectedPool={selectedPool}
      />
      {poolId && (
        <div className="size-full flex flex-col gap-2">
          <WithdrawPctSlider />
          <PoolBalancesPreview label="Withdraw balance" className="bg-muted" />
          <Button
            type="submit"
            className="mt-2"
            disabled={buttonProps.disabled}
            loading={isSubmitting}
            loadingText="Creating hook..."
          >
            {buttonProps.message}
          </Button>
        </div>
      )}
    </Form>
  );
}
