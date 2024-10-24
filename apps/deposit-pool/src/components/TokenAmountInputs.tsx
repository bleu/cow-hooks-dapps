import {
  type IBalance,
  type IPool,
  Spinner,
  TokenLogoWithWeight,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { Button, Input, Label, formatNumber } from "@bleu/ui";
import { useCallback, useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { type Address, formatUnits } from "viem";
import { usePoolBalance } from "#/hooks/usePoolBalance";
import type { FormType } from "#/types";
import { calculateProportionalTokenAmounts, getTokenPrice } from "#/utils/math";

export function TokenAmountInputs({ pool }: { pool: IPool | undefined }) {
  const { context } = useIFrameContext();
  const { control, setValue } = useFormContext<FormType>();

  const { data: poolBalances, isLoading: isBalanceLoading } = usePoolBalance({
    poolId: pool?.id,
    chainId: context?.chainId,
  });

  const { isSubmitting } = useFormState({
    control,
  });

  const [amounts, referenceTokenAddress] = useWatch({
    control,
    name: ["amounts", "referenceTokenAddress"],
  });

  const referenceAmount = useMemo(() => {
    if (!referenceTokenAddress || !amounts) return;
    return amounts[referenceTokenAddress.toLowerCase()];
  }, [amounts, referenceTokenAddress]);

  const tokenPrices = useMemo(
    () => poolBalances?.map((poolBalance) => getTokenPrice(poolBalance)),
    [poolBalances],
  );

  const totalUsd = useMemo(() => {
    if (!poolBalances || !tokenPrices || !amounts) return 0;

    return poolBalances.reduce((acc, poolBalance, index) => {
      const amount = Number(amounts?.[poolBalance.token.address.toLowerCase()]);
      const tokenPrice = tokenPrices[index];

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

      for (const tokenAmount of proportionalAmounts.tokenAmounts) {
        const tokenAmountAddress = tokenAmount.address.toLowerCase();
        if (address.toLowerCase() === tokenAmountAddress) continue;

        const tokenAmountKey = `amounts.${tokenAmountAddress}` as const;
        const calculatedAmount = Number(
          formatUnits(tokenAmount.rawAmount, tokenAmount.decimals),
        );
        setValue(tokenAmountKey, calculatedAmount);
      }

      setValue("referenceTokenAddress", address);
    },
    [poolBalances, tokenPrices, pool, setValue],
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
      <div className="flex flex-row justify-between border border-muted px-5 py-2 mb-3 rounded-xl text-md">
        <span>Total</span>
        <span className="text-right">
          ${totalUsd >= 0 ? formatNumber(totalUsd, 2) : "0"}
        </span>
      </div>
      <Button
        type="submit"
        className="my-2 rounded-xl text-lg min-h-[58px] font-semibold"
        loading={isSubmitting}
        disabled={!referenceAmount || referenceAmount <= 0}
        loadingText="Creating hook..."
      >
        {context?.hookToEdit ? "Update post-hook" : "Add post-hook"}
      </Button>
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
  const { register, control } = useFormContext<FormType>();

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
    [updateTokenAmounts, poolBalance.token.address],
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
                e.key,
              )
            )
              e.preventDefault();
          }}
          onWheel={(e) => {
            // @ts-ignore
            e.target.blur();
          }}
          step={`0.${"0".repeat(poolBalance?.token?.decimals - 1)}1`}
        />
        <i className="text-xs text-right font-light">
          ${amountUsd && amountUsd >= 0 ? formatNumber(amountUsd, 2) : "0"}
        </i>
      </div>
    </div>
  );
}
