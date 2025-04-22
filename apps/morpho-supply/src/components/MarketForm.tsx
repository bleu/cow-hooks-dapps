import { formatNumber } from "@bleu.builders/ui";

import {
  ButtonPrimary,
  Info,
  InfoContent,
  type MorphoMarket,
  useIFrameContext,
  useReadTokenContract,
} from "@bleu/cow-hooks-ui";
import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useDynamicBorrow } from "#/hooks/useDynamicBorrow";
import { useFormatTokenAmount } from "#/hooks/useFormatTokenAmount";
import { useMaxBorrowableAmount } from "#/hooks/useMaxBorrowableAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { AmountInput } from "./AmoutIntput";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export function MarketForm({ market }: { market: MorphoMarket }) {
  const { context } = useIFrameContext();

  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { supplyAmount, borrowAmount, isMaxBorrow, isMaxSupply } = useWatch({
    control,
  });

  const fiatSupplyAmount = supplyAmount
    ? `~${formatNumber(Number(supplyAmount) * market.collateralAsset.priceUsd, 2, "currency", "standard")}`
    : "~$0.0";

  const fiatBorrowAmount = borrowAmount
    ? `~${formatNumber(Number(borrowAmount) * market.loanAsset.priceUsd, 2, "currency", "standard")}`
    : "~$0.0";

  const { userBalance: collateralBalance, tokenDecimals: collateralDecimals } =
    useReadTokenContract({
      tokenAddress: market.collateralAsset.address,
    });

  const { collateral } = market.position;

  const borrow = useDynamicBorrow({ market });

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
    amount: borrow,
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
    if (isMaxBorrow && maxBorrowableFull) {
      const newBorrow = maxBorrowableFull;
      setValue("borrowAmount", newBorrow);
    }
  }, [isMaxBorrow, maxBorrowableFull, setValue]);

  useEffect(() => {
    if (isMaxSupply && collateralBalanceFull) {
      const newSupply = collateralBalanceFull;
      setValue("supplyAmount", newSupply);
    }
  }, [isMaxSupply, collateralBalanceFull, setValue]);

  const borrowAfter =
    borrow &&
    borrow +
      (decimalsToBigInt(borrowAmount, market.loanAsset.decimals) ?? BigInt(0));

  const { formatted: borrowAfterFormatted, usd: borrowAfterUsd } =
    useFormatTokenAmount({
      amount: borrowAfter,
      decimals: market.loanAsset.decimals,
      priceUsd: market.loanAsset.priceUsd,
    });

  const collateralAfter =
    collateral &&
    collateral +
      (decimalsToBigInt(supplyAmount, market.collateralAsset.decimals) ??
        BigInt(0));
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
    "percent"
  );

  const supplyAmountBigInt = decimalsToBigInt(
    supplyAmount,
    market.collateralAsset.decimals
  );
  const isInsufficientBalance = Boolean(
    collateralBalance !== undefined &&
      supplyAmountBigInt !== undefined &&
      supplyAmountBigInt > collateralBalance
  );

  const borrowAmountBigInt = decimalsToBigInt(
    borrowAmount,
    market.loanAsset.decimals
  );
  const isInsufficientPosition = Boolean(
    maxBorrowableAmount !== undefined &&
      borrowAmountBigInt !== undefined &&
      borrowAmountBigInt > maxBorrowableAmount
  );

  const buttonMessage = useMemo(() => {
    if (isInsufficientBalance)
      return `Insufficient ${market.collateralAsset.symbol} Balance`;

    if (isInsufficientPosition) return <span>Insufficient Collateral</span>;

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
  ]);

  if (!context) return null;

  return (
    <div className="flex flex-col w-full gap-4 mt-4">
      <AmountInput
        name="supplyAmount"
        label="Supply Collateral"
        maxName="isMaxSupply"
        asset={market.collateralAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={formattedCollateralBalance}
        floatBalance={collateralBalanceFull}
        fiatBalance={fiatSupplyAmount}
      />
      <AmountInput
        name="borrowAmount"
        label="Borrow"
        maxName="isMaxBorrow"
        asset={market.loanAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxBorrowableFormatted}
        floatBalance={maxBorrowableFull ?? 0.0}
        fiatBalance={fiatBorrowAmount}
      />
      <div className="flex flex-col gap-2 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker rounded-xl items-start">
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          Your collateral position ({market.collateralAsset.symbol})
        </span>
        <div className="flex gap-2">
          <span>{`${formattedCollateral} -> ${collateralAfterFormatted}`}</span>
        </div>
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          Your loan position ({market.loanAsset.symbol})
        </span>
        <div className="flex items-center gap-2">
          <span className="opacity-70 font-semibold">{formattedBorrow}</span>
          <ArrowRightIcon className="w-5 h-5 opacity-70" />
          <span className="font-semibold">{borrowAfterFormatted}</span>
        </div>
        <span className="opacity-60 text-sm mb-[-8px] font-medium">
          LTV / Liquidation LTV
        </span>
        <div className="flex items-center gap-2">
          <span className="opacity-70 font-semibold">{ltvBefore}</span>
          <ArrowRightIcon className="w-5 h-5 opacity-70" />
          <span className="font-semibold">
            {ltvAfter} / {lltv}
          </span>
        </div>
      </div>
      <Info content={<InfoContent />} />
      <ButtonPrimary
        type="submit"
        className="mb-4"
        disabled={isInsufficientBalance || isInsufficientPosition}
      >
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
