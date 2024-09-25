"use client";

import { Button, Form } from "@bleu/ui";
import {
  type HookDappContext,
  initCoWHookDapp,
} from "@cowprotocol/hook-dapp-lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PoolBalancesPreview } from "#/components/PoolBalancePreview";
import { PoolsDropdownMenu } from "#/components/PoolsDropdownMenu";
import { WithdrawPctSlider } from "#/components/WithdrawPctSlider";
import { usePoolUserBalance } from "#/hooks/usePoolUserBalance";
import type { IMinimalPool } from "#/types";
import { multiplyValueByPct } from "#/utils";
import { withdrawSchema } from "#/utils/schema";

export default function Page() {
  const [context, setContext] = useState<HookDappContext | null>(null);

  const form = useForm<typeof withdrawSchema._type>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      poolId: "",
      withdrawPct: 100,
    },
  });

  const { setValue, control } = form;

  const { withdrawPct, poolId } = useWatch({ control });

  const poolBalances = usePoolUserBalance(poolId);
  const poolBalancesAfterWithdraw = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, withdrawPct),
      fiatAmount: multiplyValueByPct(poolBalance.fiatAmount, withdrawPct),
    }));
  }, [poolBalances, withdrawPct]);

  const buttonProps = useMemo(() => {
    if (!withdrawPct || withdrawPct === 0)
      return { disabled: true, message: "Define percentage" };
    return { disabled: false, message: "Add pre-hook" };
  }, [withdrawPct]);

  useEffect(() => {
    initCoWHookDapp({ onContext: setContext });
  }, []);

  return (
    <Form {...form} className="w-full flex flex-col gap-2 py-2 px-4">
      <PoolsDropdownMenu
        account={context?.account}
        onSelect={(pool: IMinimalPool) => setValue("poolId", pool.id)}
        selectedPoolId={poolId}
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
            className="mt-2"
            disabled={buttonProps.disabled}
          >
            {buttonProps.message}
          </Button>
        </div>
      )}
    </Form>
  );
}
