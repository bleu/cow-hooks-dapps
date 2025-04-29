import { formatNumber } from "@bleu.builders/ui";

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
import { useMaxBorrowableAmount } from "#/hooks/useMaxBorrowableAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { AmountInput } from "./AmoutIntput";

export function RepayWithdrawMarketForm({
  market,
  dynamicBorrow,
}: { market: MorphoMarket; dynamicBorrow?: bigint }) {
  const { context } = useIFrameContext();

  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { repayAmount, withdrawAmount, isMaxRepay, isMaxWithdraw } = useWatch({
    control,
  });

  // TODO: MORPHO-6, MORPHO-35 Handle fields logics and integrate

  const fiatRepayAmount = repayAmount
    ? Number(repayAmount) * market.collateralAsset.priceUsd < 0.01
      ? "≈ $< 0.01"
      : `≈ ${formatNumber(Number(repayAmount) * market.collateralAsset.priceUsd, 2, "currency", "standard")}`
    : "";

  const fiatWithdrawAmount = withdrawAmount
    ? Number(withdrawAmount) * market.loanAsset.priceUsd < 0.01
      ? "≈ $< 0.01"
      : `≈ ${formatNumber(Number(withdrawAmount) * market.loanAsset.priceUsd, 2, "currency", "standard")}`
    : "";

  const { userBalance: collateralBalance, tokenDecimals: collateralDecimals } =
    useReadTokenContract({
      tokenAddress: market.collateralAsset.address,
    });

  const { collateral } = market.position;

  const {
    fullDecimals: collateralBalanceFull,
    formatted: formattedCollateralBalance,
  } = useFormatTokenAmount({
    amount: collateralBalance,
    decimals: collateralDecimals,
  });

  const { formatted: formattedCollateral, usd: collateralUsd } =
    useFormatTokenAmount({
      amount: collateral,
      decimals: collateralDecimals,
      priceUsd: market.collateralAsset.priceUsd,
    });

  const { formatted: formattedBorrow, usd: borrowUsd } = useFormatTokenAmount({
    amount: dynamicBorrow,
    decimals: market.loanAsset.decimals,
    priceUsd: market.loanAsset.priceUsd,
  });

  const maxBorrowableAmount = useMaxBorrowableAmount();

  const { formatted: maxBorrowableFormatted, fullDecimals: maxBorrowableFull } =
    useFormatTokenAmount({
      amount: maxBorrowableAmount,
      decimals: market.loanAsset.decimals,
    });

  useEffect(() => {
    if (isMaxWithdraw && maxBorrowableFull) {
      const newBorrow = maxBorrowableFull;
      setValue("withdrawAmount", Number(newBorrow));
    }
  }, [isMaxWithdraw, maxBorrowableFull, setValue]);

  useEffect(() => {
    if (isMaxRepay && collateralBalanceFull) {
      const newSupply = collateralBalanceFull;
      setValue("repayAmount", Number(newSupply));
    }
  }, [isMaxRepay, collateralBalanceFull, setValue]);

  const borrowAfter =
    dynamicBorrow !== undefined && withdrawAmount
      ? dynamicBorrow +
        (decimalsToBigInt(withdrawAmount, market.loanAsset.decimals) ??
          BigInt(0))
      : undefined;

  const { formatted: borrowAfterFormatted, usd: borrowAfterUsd } =
    useFormatTokenAmount({
      amount: borrowAfter,
      decimals: market.loanAsset.decimals,
      priceUsd: market.loanAsset.priceUsd,
    });

  const collateralAfter =
    collateral !== undefined && repayAmount
      ? collateral +
        (decimalsToBigInt(repayAmount, market.collateralAsset.decimals) ??
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

  const supplyAmountBigInt = decimalsToBigInt(
    repayAmount,
    market.collateralAsset.decimals,
  );
  const isInsufficientBalance = Boolean(
    collateralBalance !== undefined &&
      supplyAmountBigInt !== undefined &&
      supplyAmountBigInt > collateralBalance,
  );

  const borrowAmountBigInt = decimalsToBigInt(
    withdrawAmount,
    market.loanAsset.decimals,
  );
  const isInsufficientPosition = Boolean(
    maxBorrowableAmount !== undefined &&
      borrowAmountBigInt !== undefined &&
      borrowAmountBigInt > maxBorrowableAmount,
  );

  const buttonMessage = useMemo(() => {
    if (isInsufficientBalance)
      return `Insufficient ${market.collateralAsset.symbol} Balance`;

    if (isInsufficientPosition) return <span>Insufficient Collateral</span>;

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
    market.collateralAsset.symbol,
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
        asset={market.collateralAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={formattedCollateralBalance}
        floatBalance={collateralBalanceFull}
        fiatBalance={fiatRepayAmount}
      />
      <AmountInput
        name={InputFieldName.WithdrawAmount}
        label="Withdraw Collateral"
        maxName={MaxFieldName.IsMaxWithdraw}
        asset={market.loanAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxBorrowableFormatted}
        floatBalance={maxBorrowableFull ?? 0.0}
        fiatBalance={fiatWithdrawAmount}
      />
      <div className="flex flex-col gap-2 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker rounded-xl items-start">
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          Your collateral position ({market.collateralAsset.symbol})
        </span>
        <div className="flex items-center gap-2">
          {(repayAmount || withdrawAmount) && (
            <>
              <span className="opacity-70 font-semibold">
                {formattedCollateral}
              </span>
              <ArrowRightIcon className="w-5 h-5 opacity-70" />
            </>
          )}
          <span className="font-semibold">{collateralAfterFormatted}</span>
        </div>
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          Your loan position ({market.loanAsset.symbol})
        </span>
        <div className="flex items-center gap-2">
          {(repayAmount || withdrawAmount) && (
            <>
              <span className="opacity-70 font-semibold">
                {formattedBorrow}
              </span>
              <ArrowRightIcon className="w-5 h-5 opacity-70" />
            </>
          )}
          <span className="font-semibold">{borrowAfterFormatted}</span>
        </div>
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          LTV / Liquidation LTV
        </span>
        <div className="flex items-center gap-2">
          {(repayAmount || withdrawAmount) && (
            <>
              <span className="opacity-70 font-semibold">{ltvBefore}</span>
              <ArrowRightIcon className="w-5 h-5 opacity-70" />
            </>
          )}
          <span className="font-semibold">
            {ltvAfter} / {lltv}
          </span>
        </div>
      </div>
      <Info content={<InfoContent />} />
      <ButtonPrimary
        type="submit"
        className="mb-4"
        disabled={
          isInsufficientBalance ||
          isInsufficientPosition ||
          (!repayAmount && !withdrawAmount)
        }
      >
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
