import { usePoolBalance } from "#/hooks/usePoolBalance";
import { FormType } from "#/types";
import { calculateProportionalTokenAmounts, getTokenPrice } from "#/utils/math";
import { IPool, Spinner, useIFrameContext } from "@bleu/cow-hooks-ui";
import { Button, formatNumber, Label } from "@bleu/ui";
import { useCallback, useMemo } from "react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import { Address, formatUnits } from "viem";
import { TokenAmountInput } from "./TokenAmountInput";

export function PoolForm({ pool }: { pool: IPool | undefined }) {
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
    [poolBalances]
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
          tokenAmount.decimals
        );

        setValue(tokenAmountKey, calculatedAmount);
      }

      setValue("referenceTokenAddress", address);
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
      <Button
        type="submit"
        className="my-2 rounded-xl text-lg min-h-[58px] font-semibold w-full"
        loading={isSubmitting}
        disabled={!referenceAmount || referenceAmount === "0"}
        loadingText="Creating hook..."
      >
        {context?.hookToEdit ? "Update post-hook" : "Add post-hook"}
      </Button>
    </div>
  );
}
