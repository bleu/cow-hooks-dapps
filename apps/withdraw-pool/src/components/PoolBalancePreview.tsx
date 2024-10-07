"use client";

import { TokenAmount, TokenInfo } from "@bleu/cow-hooks-ui";
import { Label, cn } from "@bleu/ui";
import type { IPoolBalance } from "../types";
import { formatUnits } from "ethers/lib/utils";
import { useMemo } from "react";
import { useUserPoolBalance } from "#/hooks/useUserPoolBalance";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { useFormContext, useWatch } from "react-hook-form";
import { multiplyValueByPct } from "#/utils/math";
import { Spinner } from "./Spinner";

export function PoolBalancesPreview({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { control } = useFormContext();

  const { withdrawPct, poolId } = useWatch({ control });

  const { context } = useIFrameContext();

  const { data: poolBalances, isValidating } = useUserPoolBalance({
    user: context?.account,
    chainId: context?.chainId,
    poolId,
  });

  const poolBalance = useMemo(() => {
    if (!poolBalances || !withdrawPct) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, withdrawPct).toString(),
      fiatAmount: (poolBalance.fiatAmount * withdrawPct) / 100,
    }));
  }, [poolBalances, withdrawPct]);

  if (isValidating) return <Spinner />;

  return (
    <div className={cn("p-2 rounded-md", className)}>
      <Label>{label}</Label>
      <div className={"flex flex-col gap-2 p-2"}>
        {poolBalance.map((poolBalance) => (
          <PoolBalancePreview
            key={poolBalance.token.address}
            poolBalance={poolBalance}
          />
        ))}
      </div>
    </div>
  );
}

export function PoolBalancePreview({
  poolBalance,
}: {
  poolBalance: IPoolBalance;
}) {
  return (
    <div className="flex w-full justify-between align-items-center">
      <TokenInfo token={poolBalance.token} showExplorerLink={true} />
      <TokenAmount
        token={poolBalance.token}
        balance={Number(
          formatUnits(poolBalance.balance, poolBalance.token.decimals)
        )}
        fiatValue={poolBalance.fiatAmount}
      />
    </div>
  );
}
