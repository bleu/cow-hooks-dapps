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
import { InputFieldName, MaxFieldName } from "#/constants/forms";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useFormatTokenAmount } from "#/hooks/useFormatTokenAmount";
import { useMaxBorrowableAmount } from "#/hooks/useMaxBorrowableAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { AmountInput } from "./AmoutIntput";
import { PositionSummary } from "./PositionSummary";

interface SupplyBorrowMarketFormProps {
  market: MorphoMarket;
  dynamicBorrow?: bigint;
}

export function SupplyBorrowMarketForm({
  market,
  dynamicBorrow,
}: SupplyBorrowMarketFormProps) {
  const { context } = useIFrameContext();

  const { control, setValue } = useFormContext<MorphoSupplyFormData>();
  const { supplyAmount, borrowAmount, isMaxBorrow, isMaxSupply } = useWatch({
    control,
  });

  const fiatSupplyAmount = supplyAmount
    ? Number(supplyAmount) * market.collateralAsset.priceUsd < 0.01
      ? "≈ $< 0.01"
      : `≈ ${formatNumber(Number(supplyAmount) * market.collateralAsset.priceUsd, 2, "currency", "standard")}`
    : "";

  const fiatBorrowAmount = borrowAmount
    ? Number(borrowAmount) * market.loanAsset.priceUsd < 0.01
      ? "≈ $< 0.01"
      : `≈ ${formatNumber(Number(borrowAmount) * market.loanAsset.priceUsd, 2, "currency", "standard")}`
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
    if (isMaxBorrow && maxBorrowableFull) {
      const newBorrow = maxBorrowableFull;
      setValue("borrowAmount", Number(newBorrow));
    }
  }, [isMaxBorrow, maxBorrowableFull, setValue]);

  useEffect(() => {
    if (isMaxSupply && collateralBalanceFull) {
      const newSupply = collateralBalanceFull;
      setValue("supplyAmount", Number(newSupply));
    }
  }, [isMaxSupply, collateralBalanceFull, setValue]);

  const borrowAfter =
    dynamicBorrow !== undefined && borrowAmount
      ? dynamicBorrow +
        (decimalsToBigInt(borrowAmount, market.loanAsset.decimals) ?? BigInt(0))
      : undefined;

  const { formatted: borrowAfterFormatted, usd: borrowAfterUsd } =
    useFormatTokenAmount({
      amount: borrowAfter,
      decimals: market.loanAsset.decimals,
      priceUsd: market.loanAsset.priceUsd,
    });

  const collateralAfter =
    collateral !== undefined && supplyAmount
      ? collateral +
        (decimalsToBigInt(supplyAmount, market.collateralAsset.decimals) ??
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
    supplyAmount,
    market.collateralAsset.decimals,
  );
  const isInsufficientBalance = Boolean(
    collateralBalance !== undefined &&
      supplyAmountBigInt !== undefined &&
      supplyAmountBigInt > collateralBalance,
  );

  const borrowAmountBigInt = decimalsToBigInt(
    borrowAmount,
    market.loanAsset.decimals,
  );
  const isInsufficientPosition = Boolean(
    maxBorrowableAmount !== undefined &&
      borrowAmountBigInt !== undefined &&
      borrowAmountBigInt > maxBorrowableAmount,
  );

  const buttonMessage = useMemo(() => {
    if (dynamicBorrow === undefined) return "Loading...";

    if (isInsufficientBalance)
      return `Insufficient ${market.collateralAsset.symbol} Balance`;

    if (isInsufficientPosition) return <span>Insufficient Collateral</span>;

    if (!supplyAmount && !borrowAmount)
      return <span>Enter supply or borrow</span>;

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
    supplyAmount,
    borrowAmount,
    dynamicBorrow,
  ]);

  const shouldRenderAfter = Boolean(supplyAmount || borrowAmount);

  if (!context) return null;

  return (
    <div className="flex flex-col w-full gap-4 mt-4">
      <AmountInput
        name={InputFieldName.SupplyAmount}
        label="Supply Collateral"
        maxName={MaxFieldName.IsMaxSupply}
        asset={market.collateralAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={formattedCollateralBalance}
        floatBalance={collateralBalanceFull}
        fiatBalance={fiatSupplyAmount}
        isLoading={dynamicBorrow === undefined}
      />
      <AmountInput
        name={InputFieldName.BorrowAmount}
        label="Borrow"
        maxName={MaxFieldName.IsMaxBorrow}
        asset={market.loanAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxBorrowableFormatted}
        floatBalance={maxBorrowableFull ?? 0.0}
        fiatBalance={fiatBorrowAmount}
        isLoading={dynamicBorrow === undefined}
      />
      <PositionSummary
        market={market}
        formattedCollateral={formattedCollateral}
        formattedBorrow={formattedBorrow}
        collateralAfterFormatted={collateralAfterFormatted}
        borrowAfterFormatted={borrowAfterFormatted}
        ltvBefore={ltvBefore}
        ltvAfter={ltvAfter}
        lltv={lltv}
        shouldRenderAfter={shouldRenderAfter}
        isChanging={Boolean(supplyAmount || borrowAmount)}
        isLoading={dynamicBorrow === undefined}
      />
      <Info content={<InfoContent />} />
      <ButtonPrimary
        type="submit"
        className="mb-4"
        disabled={
          isInsufficientBalance ||
          isInsufficientPosition ||
          (!supplyAmount && !borrowAmount)
        }
      >
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
