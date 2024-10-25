import {
  ButtonPrimary,
  type IPool,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { Label, formatNumber } from "@bleu/ui";
import { useCallback, useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { type Address, formatUnits } from "viem";
import { usePoolBalance } from "#/hooks/usePoolBalance";
import type { FormType } from "#/types";
import { calculateProportionalTokenAmounts, getTokenPrice } from "#/utils/math";
import { TokenAmountInput } from "./TokenAmountInput";
import { useTokenContext } from "#/contexts/tokens";

export function PoolForm({ pool }: { pool: IPool | undefined }) {
  const { context } = useIFrameContext();
  const { control, setValue } = useFormContext<FormType>();

  const { tokens } = useTokenContext();

  const { data: poolBalances, isLoading: isBalanceLoading } = usePoolBalance({
    poolId: pool?.id,
    chainId: context?.chainId,
  });

  const { isSubmitting } = useFormState({
    control,
  });

  const amounts = useWatch({ control, name: "amounts" });
  const referenceTokenAddress = useWatch({
    control,
    name: "referenceTokenAddress",
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
    (amount: string, address: Address) => {
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
        const calculatedAmount = formatUnits(
          tokenAmount.rawAmount,
          tokenAmount.decimals,
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

  const addressToken1 = poolBalances[0].token.address.toLowerCase();
  const isInsufficientToken1 =
    tokens && poolBalances?.[0] && amounts
      ? tokens[addressToken1].balanceAfterSwap <
        Number(amounts?.[addressToken1])
      : false;

  const addressToken2 = poolBalances[1].token.address.toLowerCase();
  const isInsufficientToken2 =
    tokens && poolBalances?.[0] && amounts
      ? tokens[addressToken2].balanceAfterSwap <
        Number(amounts?.[addressToken2])
      : false;

  const shouldDisableButton =
    !referenceAmount ||
    referenceAmount === "0" ||
    isSubmitting ||
    isInsufficientToken1 ||
    isInsufficientToken2;

  const ButtonMessage = () => {
    if (isInsufficientToken1)
      return `Insufficient ${tokens ? tokens[addressToken1].symbol : ""} balance`;
    if (isInsufficientToken2)
      return `Insufficient ${tokens ? tokens[addressToken1].symbol : ""} balance`;
    if (isSubmitting) return "Creating hook...";
    if (context?.hookToEdit) return "Update post-hook";
    return "Add post-hook";
  };

  return (
    <div className="flex flex-col w-full items-center gap-1">
      <Label className="block text-md mt-1">Add liquidity</Label>
      <div className="flex flex-col gap-2">
        {poolBalances.map((poolBalance, index) => (
          <TokenAmountInput
            key={poolBalance.token.address}
            poolBalance={poolBalance}
            tokenPrice={tokenPrices?.[index]}
            updateTokenAmounts={updateTokenAmounts}
          />
        ))}
      </div>
      <div className="flex w-full flex-row justify-between border border-muted px-5 py-2 mb-3 rounded-xl text-md">
        <span>Total</span>
        <span className="text-right">
          ${totalUsd >= 0 ? formatNumber(totalUsd, 2) : "0"}
        </span>
      </div>
      <ButtonPrimary type="submit" disabled={shouldDisableButton}>
        <ButtonMessage />
      </ButtonPrimary>
    </div>
  );
}
