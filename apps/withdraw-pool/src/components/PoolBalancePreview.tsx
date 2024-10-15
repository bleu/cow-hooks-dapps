"use client";

import { BalancesPreview, type IBalance } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { multiplyValueByPct } from "#/utils/math";

const PREVIEW_LABELS = ["Current balance", "Withdraw balance"];

export function PoolBalancesPreview({
  poolBalances,
}: {
  poolBalances: IBalance[];
}) {
  const { control } = useFormContext();

  const { withdrawPct } = useWatch({ control });

  const withdrawBalance = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, withdrawPct).toString(),
      fiatAmount: (poolBalance.fiatAmount * withdrawPct) / 100,
    }));
  }, [poolBalances, withdrawPct]);

  return (
    <BalancesPreview
      labels={PREVIEW_LABELS}
      balancesList={[poolBalances, withdrawBalance]}
    />
  );
}
