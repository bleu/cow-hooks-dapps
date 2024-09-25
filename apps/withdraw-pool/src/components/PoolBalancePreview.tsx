"use client";

import { TokenAmount, TokenInfo, TokenLogo } from "@bleu/cow-hooks-ui";
import { Label, cn } from "@bleu/ui";
import type { IPoolBalance } from "../types";

export function PoolBalancesPreview({
  label,
  poolBalance,
  className,
}: {
  label: string;
  poolBalance: IPoolBalance[];
  className?: string;
}) {
  return (
    <div className={cn("p-2", className)}>
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
        balance={Number(poolBalance.balance)}
        fiatValue={Number(poolBalance.fiatAmount)}
      />
    </div>
  );
}
