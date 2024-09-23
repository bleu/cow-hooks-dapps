"use client";

import { StrictMode, useEffect, useMemo, useState } from "react";
import { initCoWHookDapp, HookDappContext } from "@cowprotocol/hook-dapp-lib";
import { useUserPools } from "#/hooks/useUserPools";
import { IMinimalPool } from "#/types";
import { usePoolUserBalance } from "#/hooks/usePoolUserBalance";
import { multiplyValueByPct } from "#/utils";
import { DropdownMenu } from "@bleu/ui";

export default function Page() {
  const [context, setContext] = useState<HookDappContext | null>(null);

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({ onContext: setContext });
  }, []);

  const pools = useUserPools(context?.account);
  const [selectedPool, setSelectedPool] = useState<IMinimalPool>();
  const poolBalances = usePoolUserBalance(selectedPool?.id);
  const [withdrawPct, setWithdrawPct] = useState<number>(100);

  const poolBalancesAfterWithdraw = useMemo(() => {
    if (!poolBalances) return [];
    return poolBalances.map((poolBalance) => ({
      ...poolBalance,
      balance: multiplyValueByPct(poolBalance.balance, 100 - withdrawPct),
      fiatAmount: multiplyValueByPct(poolBalance.fiatAmount, 100 - withdrawPct),
    }));
  }, [poolBalances, withdrawPct]);

  const buttonProps = useMemo(() => {
    if (!context?.account)
      return { disabled: true, message: "Connect wallet to withdraw" };
    if (!pools.length)
      return { disabled: true, message: "No pools to withdraw from" };
    if (!selectedPool)
      return { disabled: true, message: "Choose liquidity pool" };
    if (!withdrawPct) return { disabled: true, message: "Define percentage" };
    return { disabled: false, message: "Add pre-hook" };
  }, [context?.account, pools, selectedPool, withdrawPct]);

  return (
    <div className="size-full flex flex-col gap-2 p-2 justify-center">
      <DropdownMenu
        items={pools.map((pool) => ({ value: pool.symbol, id: pool.id }))}
        text={
          selectedPool?.symbol || "Choose a pool to remove liquidity from.."
        }
        setSelectedItem={({ id }) =>
          setSelectedPool(pools.find((pool) => pool.id === id))
        }
      />
      {selectedPool && (
        <>
          <div>
            <PoolBalancesPreview
              label="Current balance"
              poolBalance={poolBalances}
            />
          </div>
          <div>
            <Slider
              value={withdrawPct}
              setValue={setWithdrawPct}
              title="Define withdrawal percentage"
            />
          </div>
          <div>
            <PoolBalancesPreview
              label="Balance after withdraw"
              poolBalance={poolBalancesAfterWithdraw}
              backgroundColor={UI.COLOR_PAPER_DARKER}
            />
          </div>
        </>
      )}
      <ButtonPrimary disabled={buttonProps.disabled}>
        {buttonProps.message}
      </ButtonPrimary>
    </div>
  );
}
