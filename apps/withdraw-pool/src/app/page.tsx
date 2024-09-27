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
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { multiplyValueByPct } from "#/utils/math";
import { useGetHooksTransactions } from "#/hooks/useGetHooksTransactions";
import { useIFrameContext } from "#/context/iframe";

export default function Page() {
  const {
    context,
    userPoolSwr: { data: pools },
  } = useIFrameContext();
  const form = useForm<typeof withdrawSchema._type>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const { setValue, control } = form;

  const { withdrawPct, poolId } = useWatch({ control });

  const { data: poolBalances } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId,
  });

  const selectedPool = useMemo(
    () => pools?.find((pool) => pool.id === poolId),
    [pools, poolId]
  );

  const getHooksTransactions = useGetHooksTransactions(selectedPool);

  const poolBalancesAfterWithdraw = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, withdrawPct).toString(),
      fiatAmount: (poolBalance.fiatAmount * withdrawPct) / 100,
    }));
  }, [poolBalances, withdrawPct]);

  const buttonProps = useMemo(() => {
    if (!withdrawPct || withdrawPct === 0)
      return { disabled: true, message: "Define percentage" };
    return { disabled: false, message: "Add pre-hook" };
  }, [withdrawPct]);

  if (!context) return <div className="w-full text-center p-2">Loading...</div>;

  return (
    <Form
      {...form}
      onSubmit={form.handleSubmit(async (data) => {
        if (!selectedPool || !context.account) return;
        const transactions = await getHooksTransactions(data.withdrawPct);
        console.log(transactions);
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
          <PoolBalancesPreview
            label="Withdraw balance"
            poolBalance={poolBalancesAfterWithdraw}
            className="bg-muted"
          />
          <Button
            type="submit"
            className="bg-primary text-primary-foreground mt-2"
            disabled={buttonProps.disabled}
          >
            {buttonProps.message}
          </Button>
        </div>
      )}
    </Form>
  );
}
