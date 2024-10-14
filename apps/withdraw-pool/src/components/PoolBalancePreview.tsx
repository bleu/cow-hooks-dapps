"use client";

import { BalancesPreview, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { multiplyValueByPct } from "#/utils/math";

const PREVIEW_LABELS = ["Pool Balance", "Withdraw Balance"];

export function PoolBalancesPreview() {
  const { control } = useFormContext();

  const { withdrawPct, poolId } = useWatch({ control });

  const { context } = useIFrameContext();

  const { data: poolBalances, isLoading } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId,
  });

  const withdrawBalance = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, withdrawPct).toString(),
      fiatAmount: (poolBalance.fiatAmount * withdrawPct) / 100,
    }));
  }, [poolBalances, withdrawPct]);

  if (!poolBalances) return;

  return (
    <BalancesPreview
      labels={PREVIEW_LABELS}
      balancesList={[poolBalances, withdrawBalance]}
      isLoading={isLoading}
    />
  );
}
