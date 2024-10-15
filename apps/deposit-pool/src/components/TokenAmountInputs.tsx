import { usePoolBalance } from "#/hooks/usePoolBalance";
import {
  IBalance,
  IPool,
  Spinner,
  TokenLogoWithWeight,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import Image from "next/image";
import { formatNumber, Input, Label } from "@bleu/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateProportionalTokenAmounts, getTokenPrice } from "#/utils/math";
import { useFormContext, useWatch } from "react-hook-form";
import { depositSchemaType } from "#/utils/schema";
import { Address, formatUnits } from "viem";

export function TokenAmountInputs({ pool }: { pool: IPool | undefined }) {
  const { context } = useIFrameContext();
  const { control, setValue } = useFormContext<depositSchemaType>();

  const { data: poolBalances, isLoading: isBalanceLoading } = usePoolBalance({
    poolId: pool?.id,
    chainId: context?.chainId,
  });

  const tokenPrices = useMemo(
    () => poolBalances?.map((poolBalance) => getTokenPrice(poolBalance)),
    [poolBalances]
  );

  const amounts = useWatch({ control, name: "amounts" });

  const totalUsd = useMemo(() => {
    if (!poolBalances || !tokenPrices || !amounts) return 0;

    return poolBalances.reduce((acc, poolBalance, index) => {
      const amount = Number(amounts?.[poolBalance.token.address.toLowerCase()]);
      const tokenPrice = tokenPrices[index];

      console.log({ amount, tokenPrice });

      if (amount && tokenPrice) {
        return acc + amount * tokenPrice;
      }

      return acc;
    }, 0);
  }, [poolBalances, tokenPrices, amounts]);

  const updateTokenAmounts = useCallback(
    (amount: number, address: Address) => {
      if (!poolBalances || !tokenPrices || !pool) return;

      const proportionalAmounts = calculateProportionalTokenAmounts({
        pool: pool,
        poolBalances: poolBalances,
        tokenAddress: address,
        tokenAmount: amount,
      });

      proportionalAmounts.tokenAmounts.forEach((tokenAmount) => {
        const tokenAmountAddress = tokenAmount.address.toLowerCase();
        if (address.toLowerCase() === tokenAmountAddress) return;

        const tokenAmountKey = `amounts.${tokenAmountAddress}` as const;
        const calculatedAmount = Number(
          formatUnits(tokenAmount.rawAmount, tokenAmount.decimals)
        );
        setValue(tokenAmountKey, calculatedAmount);
      });

      setValue(`referenceTokenAddress`, address);
    },
    [poolBalances, tokenPrices, pool, setValue]
  );

  if (!context) return null;

  if (isBalanceLoading) return <Spinner size="xl" />;

  if (!poolBalances || !poolBalances.length)
    return (
      <span className="mt-10 text-center">Error loading pool balances</span>
    );

  return (
    <div className="flex flex-col gap-2">
      <Label className="block text-sm">Add liquidity</Label>
      <div className="flex flex-col gap-2 bg-muted text-muted-foreground rounded-xl p-2">
        {poolBalances.map((poolBalance, index) => (
          <TokenAmountInput
            key={poolBalance.token.address}
            poolBalance={poolBalance}
            tokenPrice={tokenPrices?.[index]}
            updateTokenAmounts={updateTokenAmounts}
          />
        ))}
      </div>
      <div className="flex flex-row justify-between border border-1 border-muted px-5 py-2 mb-3 rounded-xl text-md">
        <span>Total</span>
        <span className="text-right">
          ${totalUsd >= 0 ? formatNumber(totalUsd, 2) : "0"}
        </span>
      </div>
      <div className="flex flex-row justify-between bg-muted text-muted-foreground items-center rounded-xl px-5 py-2 text-sm gap-5">
        <div>
          <Image
            quality={100}
            width={100}
            height={100}
            src={"assets/alert-circle.svg"}
            alt={"Alert icon"}
          />
        </div>
        Once you add the hook, any changes to the swap won't automatically
        update it. Review and adjust before swapping.
      </div>
    </div>
  );
}

export function TokenAmountInput({
  poolBalance,
  tokenPrice,
  updateTokenAmounts,
}: {
  poolBalance: IBalance;
  tokenPrice?: number;
  updateTokenAmounts: (amount: number, address: Address) => void;
}) {
  const { register, control } = useFormContext<depositSchemaType>();

  const amount = useWatch({
    control,
    name: `amounts.${poolBalance.token.address.toLowerCase()}`,
  });

  const amountUsd = useMemo(() => {
    if (!amount || !tokenPrice) return 0;

    return amount * tokenPrice;
  }, [amount, tokenPrice]);

  const onChange = useCallback(
    (amount: number) => {
      if (updateTokenAmounts) {
        updateTokenAmounts(amount, poolBalance.token.address as Address);
      }
    },
    [updateTokenAmounts, poolBalance.token.address]
  );

  return (
    <div className="flex flex-row justify-between items-center px-3">
      <TokenLogoWithWeight
        token={poolBalance.token}
        weight={poolBalance.weight}
        className="text-lg"
      />
      <div className="flex flex-col gap-1 text-right">
        <Input
          className="bg-transparent border-transparent text-md text-right placeholder:text-foreground/50 px-0"
          type="number"
          placeholder="0.0"
          {...register(`amounts.${poolBalance.token.address.toLowerCase()}`, {
            onChange: (e) => {
              onChange(Number(e.target.value));
            },
          })}
          onKeyDown={(e) => {
            if (
              ["Enter", "-", "e", "E", "+", "ArrowUp", "ArrowDown"].includes(
                e.key
              )
            )
              e.preventDefault();
          }}
        />
        <i className="text-xs text-right font-light">
          ${amountUsd && amountUsd >= 0 ? formatNumber(amountUsd, 2) : "0"}
        </i>
      </div>
    </div>
  );
}
