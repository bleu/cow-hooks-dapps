import { Label, formatNumber } from "@bleu.builders/ui";
import {
  type IPool,
  Info,
  Spinner,
  useIFrameContext,
} from "@bleu/cow-hooks-ui";
import { useCallback, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { type Address, formatUnits } from "viem";
import { usePoolBalance } from "#/hooks/usePoolBalance";
import { useSwapAmount } from "#/hooks/useSwapAmount";
import { useTokenBalanceAfterSwap } from "#/hooks/useTokenBalanceAfterSwap";
import type { FormType } from "#/types";
import { formDefaultValues } from "#/utils/formDefaultValues";
import { calculateProportionalTokenAmounts, getTokenPrice } from "#/utils/math";
import { AmountFromAccountCheckbox } from "./AmountFromAccountCheckbox";
import { AmountFromSwapCheckbox } from "./AmountFromSwapCheckbox";
import { AmountFromUserInputCheckbox } from "./AmountFromUserInputCheckbox";
import { FormButton } from "./FormButton";
import { InfoContent } from "./InfoContent";
import { TokenAmountInput } from "./TokenAmountInput";

export function PoolForm({ pool }: { pool: IPool | undefined }) {
  const { context } = useIFrameContext();
  const { control, setValue, reset } = useFormContext<FormType>();

  const { buyAmount } = useSwapAmount();
  const buyAmountAfterSwap = useTokenBalanceAfterSwap(
    context?.orderParams?.buyTokenAddress as Address,
  );

  const { data: poolBalances, isLoading: isBalanceLoading } = usePoolBalance({
    poolId: pool?.id,
    chainId: context?.chainId,
  });

  const amounts = useWatch({ control, name: "amounts" });
  const amountFromSwap = useWatch({
    control,
    name: "amountFromSwap",
  });
  const amountFromAccount = useWatch({
    control,
    name: "amountFromAccount",
  });

  useEffect(() => {
    reset({ ...formDefaultValues, poolId: pool?.id });
  }, [reset, pool]);

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

  useEffect(() => {
    if (amountFromSwap && context?.orderParams && buyAmount) {
      const address =
        context.orderParams.buyTokenAddress.toLowerCase() as Address;
      setValue(`amounts.${address}`, buyAmount);
      updateTokenAmounts(buyAmount, address);
    }
  }, [
    context?.orderParams,
    amountFromSwap,
    setValue,
    updateTokenAmounts,
    buyAmount,
  ]);

  useEffect(() => {
    if (amountFromAccount && context?.orderParams && buyAmountAfterSwap) {
      const address =
        context.orderParams.buyTokenAddress.toLowerCase() as Address;
      setValue(`amounts.${address}`, buyAmountAfterSwap);
      updateTokenAmounts(buyAmountAfterSwap, address);
    }
  }, [
    context?.orderParams,
    amountFromAccount,
    setValue,
    updateTokenAmounts,
    buyAmountAfterSwap,
  ]);

  if (!context) return null;

  if (!context?.orderParams)
    return <span>Please specify your order first</span>;

  if (isBalanceLoading) return <Spinner size="xl" />;

  if (!poolBalances || !poolBalances.length)
    return (
      <span className="mt-10 text-center">Error loading pool balances</span>
    );

  return (
    <div className="flex flex-col w-full gap-1">
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
      <div className="w-full flex flex-col gap-y-2 mb-3">
        <AmountFromUserInputCheckbox />
        <AmountFromSwapCheckbox />
        <AmountFromAccountCheckbox />
      </div>
      <Info content={<InfoContent />} />
      <FormButton poolBalances={poolBalances} />
    </div>
  );
}
