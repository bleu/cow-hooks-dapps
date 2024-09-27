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
import type { IMinimalPool } from "#/types";
import { withdrawSchema } from "#/utils/schema";
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { useTheme } from "#/context/theme";

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

  const { data: poolBalances } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId,
  });

  const poolBalancesAfterWithdraw = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    console.log({ poolBalances });
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: poolBalance.balance.mul(withdrawPct).div(100),
      fiatAmount: (poolBalance.fiatAmount * withdrawPct) / 100,
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

  const { theme, toggleTheme } = useTheme();

  if (!context) return <div className="w-full text-center p-2">Loading...</div>;

  return (
    <Form {...form} className="w-full flex flex-col gap-1 py-1 px-4">
      {/* <button
        onClick={toggleTheme}
        className="p-2 text-yellow-700"
        type="button"
      >
        Switch to {theme === "light" ? "Dark" : "Light"} Theme
      </button> */}
      <PoolsDropdownMenu
        account={context?.account}
        chainId={context?.chainId}
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
