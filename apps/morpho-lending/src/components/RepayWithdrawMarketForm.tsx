import { cn, formatNumber } from "@bleu.builders/ui";

import {
  ButtonPrimary,
  Info,
  InfoContent,
  type MorphoMarket,
  useIFrameContext,
  useReadTokenContract,
} from "@bleu/cow-hooks-ui";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { InputFieldName, MaxFieldName } from "#/constants/forms";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useFormatTokenAmount } from "#/hooks/useFormatTokenAmount";
import { useMaxWithdrawbleAmount } from "#/hooks/useMaxWithdrawbleAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { AmountInput } from "./AmoutIntput";

interface RepayWithdrawMarketFormProps {
  market: MorphoMarket;
  dynamicBorrow?: bigint;
}

export function RepayWithdrawMarketForm({
  market,
  dynamicBorrow,
}: RepayWithdrawMarketFormProps) {
  const { context } = useIFrameContext();
  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { repayAmount, withdrawAmount, isMaxRepay, isMaxWithdraw } = useWatch({
    control,
  });

  const fiatRepayAmount = repayAmount
    ? Number(repayAmount) * market.loanAsset.priceUsd < 0.01
      ? "≈ $< 0.01"
      : `≈ ${formatNumber(Number(repayAmount) * market.loanAsset.priceUsd, 2, "currency", "standard")}`
    : "";

  const fiatWithdrawAmount = withdrawAmount
    ? Number(withdrawAmount) * market.collateralAsset.priceUsd < 0.01
      ? "≈ $< 0.01"
      : `≈ ${formatNumber(Number(withdrawAmount) * market.collateralAsset.priceUsd, 2, "currency", "standard")}`
    : "";

  const { userBalance: borrowedBalance } = useReadTokenContract({
    tokenAddress: market.loanAsset.address,
  });

  const { collateral } = market.position;

  const { maxWithdrawableFormatted, maxWithdrawableFull, withdrawableLimit } =
    useMaxWithdrawbleAmount();
  const repayableLimit = useMemo(
    () =>
      dynamicBorrow !== undefined && borrowedBalance !== undefined
        ? dynamicBorrow < borrowedBalance
          ? dynamicBorrow
          : borrowedBalance
        : undefined,
    [dynamicBorrow, borrowedBalance],
  );

  const { formatted: maxRepayableFormatted, fullDecimals: maxRepayableFull } =
    useFormatTokenAmount({
      amount: repayableLimit,
      decimals: market.loanAsset.decimals,
    });

  const { formatted: formattedCollateral, usd: collateralUsd } =
    useFormatTokenAmount({
      amount: collateral,
      decimals: market.collateralAsset.decimals,
      priceUsd: market.collateralAsset.priceUsd,
    });

  const { formatted: formattedBorrow, usd: borrowUsd } = useFormatTokenAmount({
    amount: dynamicBorrow,
    decimals: market.loanAsset.decimals,
    priceUsd: market.loanAsset.priceUsd,
  });

  useEffect(() => {
    if (isMaxWithdraw && maxWithdrawableFull) {
      const newWithdraw = maxWithdrawableFull;
      setValue("withdrawAmount", Number(newWithdraw));
    }
  }, [isMaxWithdraw, maxWithdrawableFull, setValue]);

  useEffect(() => {
    if (isMaxRepay && maxRepayableFull) {
      const newRepay = maxRepayableFull;
      setValue("repayAmount", Number(newRepay));
    }
  }, [isMaxRepay, maxRepayableFull, setValue]);

  const repay = decimalsToBigInt(repayAmount || 0, market.loanAsset.decimals);
  const borrowAfter =
    repay && dynamicBorrow ? dynamicBorrow - repay : dynamicBorrow;

  const { formatted: borrowAfterFormatted, usd: borrowAfterUsd } =
    useFormatTokenAmount({
      amount: borrowAfter,
      decimals: market.loanAsset.decimals,
      priceUsd: market.loanAsset.priceUsd,
    });

  const collateralAfter =
    collateral !== undefined
      ? collateral -
        (decimalsToBigInt(withdrawAmount, market.collateralAsset.decimals) ??
          BigInt(0))
      : undefined;

  const { formatted: collateralAfterFormatted, usd: collateralAfterUsd } =
    useFormatTokenAmount({
      amount: collateralAfter,
      decimals: market.collateralAsset.decimals,
      priceUsd: market.collateralAsset.priceUsd,
    });

  const ltvBefore =
    borrowUsd && collateralUsd
      ? formatNumber(borrowUsd / collateralUsd, 2, "percent")
      : "0.0%";

  const ltvAfter =
    borrowAfterUsd && collateralAfterUsd
      ? formatNumber(borrowAfterUsd / collateralAfterUsd, 2, "percent")
      : "0.0%";

  const lltv = formatNumber(
    Number(market.lltv.toString().slice(0, 3)) / 1000,
    1,
    "percent",
  );

  const repayAmountBigInt = decimalsToBigInt(
    repayAmount,
    market.loanAsset.decimals,
  );

  const isInsufficientBalance = Boolean(
    borrowedBalance !== undefined &&
      repayAmountBigInt !== undefined &&
      repayAmountBigInt > borrowedBalance,
  );

  const isOverRepay = Boolean(
    dynamicBorrow !== undefined &&
      repayAmountBigInt !== undefined &&
      repayAmountBigInt > dynamicBorrow,
  );

  const withdrawAmountBigInt = decimalsToBigInt(
    withdrawAmount,
    market.collateralAsset.decimals,
  );
  const isInsufficientPosition = Boolean(
    withdrawableLimit !== undefined &&
      withdrawAmountBigInt !== undefined &&
      withdrawAmountBigInt > withdrawableLimit,
  );

  const shouldRenderAfter = Boolean(repayAmount || withdrawAmount);

  const buttonMessage = useMemo(() => {
    if (isInsufficientBalance)
      return `Insufficient ${market.loanAsset.symbol} Balance`;

    if (isInsufficientPosition)
      return `Insufficient ${market.collateralAsset.symbol} Balance`;

    if (isOverRepay) return "Repay exceeds borrow";

    if (!repayAmount && !withdrawAmount)
      return <span>Enter repay or withdraw</span>;

    if (context?.hookToEdit && context?.isPreHook)
      return <span>Update Pre-hook</span>;
    if (context?.hookToEdit && !context?.isPreHook)
      return <span>Update Post-hook</span>;
    if (!context?.hookToEdit && context?.isPreHook)
      return <span>Add Pre-hook</span>;
    if (!context?.hookToEdit && !context?.isPreHook)
      return <span>Add Post-hook</span>;
  }, [
    context?.hookToEdit,
    context?.isPreHook,
    isInsufficientBalance,
    isInsufficientPosition,
    isOverRepay,
    market.collateralAsset.symbol,
    market.loanAsset.symbol,
    repayAmount,
    withdrawAmount,
  ]);

  if (!context) return null;

  return (
    <div className="flex flex-col w-full gap-4 mt-4">
      <AmountInput
        name={InputFieldName.RepayAmount}
        label="Repay"
        maxName={MaxFieldName.IsMaxRepay}
        asset={market.loanAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxRepayableFormatted}
        floatBalance={maxRepayableFull}
        fiatBalance={fiatRepayAmount}
      />
      <AmountInput
        name={InputFieldName.WithdrawAmount}
        label="Withdraw Collateral"
        maxName={MaxFieldName.IsMaxWithdraw}
        asset={market.collateralAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxWithdrawableFormatted}
        floatBalance={maxWithdrawableFull ?? 0.0}
        fiatBalance={fiatWithdrawAmount}
      />
      <div className="flex flex-col gap-2 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker rounded-xl items-start">
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          Your collateral position ({market.collateralAsset.symbol})
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn("font-semibold", {
              "opacity-70": repayAmount || withdrawAmount,
            })}
          >
            {formattedCollateral}
          </span>
          {shouldRenderAfter && (
            <>
              <ArrowRightIcon className="w-5 h-5 opacity-70" />
              <span className="font-semibold">{collateralAfterFormatted}</span>
            </>
          )}
        </div>
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          Your loan position ({market.loanAsset.symbol})
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn("font-semibold", {
              "opacity-70": repayAmount || withdrawAmount,
            })}
          >
            {formattedBorrow}
          </span>
          {shouldRenderAfter && (
            <>
              <ArrowRightIcon className="w-5 h-5 opacity-70" />
              <span className="font-semibold">{borrowAfterFormatted}</span>
            </>
          )}
        </div>
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          LTV / Liquidation LTV
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn("font-semibold", {
              "opacity-70": repayAmount || withdrawAmount,
            })}
          >
            {ltvBefore}
          </span>
          {shouldRenderAfter && (
            <>
              <ArrowRightIcon className="w-5 h-5 opacity-70" />
              <span className="font-semibold">
                {ltvAfter} / {lltv}
              </span>
            </>
          )}
        </div>
      </div>
      <Info content={<InfoContent />} />
      <ButtonPrimary
        type="submit"
        className="mb-4"
        disabled={
          isInsufficientBalance ||
          isInsufficientPosition ||
          isOverRepay ||
          (!repayAmount && !withdrawAmount)
        }
      >
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
