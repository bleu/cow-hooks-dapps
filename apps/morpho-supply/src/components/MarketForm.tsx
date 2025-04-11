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
import { useUserMarketPosition } from "#/hooks/useUserMarketPosition";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { getMarketParams } from "#/utils/getMarketParams";
import { AmountInput } from "./AmoutIntput";

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

  const { userBalance: loanBalance, tokenDecimals: loanDecimals } =
    useReadTokenContract({
      tokenAddress: market.loanAsset.address,
    });

  const { userBalance: collateralBalance, tokenDecimals: collateralDecimals } =
    useReadTokenContract({
      tokenAddress: market.collateralAsset.address,
    });

  const marketParams = getMarketParams(market);

  const marketPosition = useUserMarketPosition({
    marketKey: market.uniqueKey,
    marketParams,
  });

  const {
    collateral,
    borrowShares,
    totalBorrowAssets,
    totalBorrowShares,
    borrowRate,
    lastUpdate,
  } = marketPosition ?? {};

  const borrow = useDynamicBorrow({
    borrowShares,
    totalBorrowAssets,
    totalBorrowShares,
    borrowRate,
    lastUpdate,
  });

  const { formatted: formattedLoanBalance } = useFormatTokenAmount({
    amount: loanBalance,
    decimals: loanDecimals,
  });

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

  const {
    fullDecimals: borrowFullDecimals,
    formatted: formattedBorrow,
    usd: borrowUsd,
  } = useFormatTokenAmount({
    amount: borrow,
    decimals: loanDecimals,
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
      : "";

  const ltvAfter =
    borrowAfterUsd && collateralAfterUsd
      ? formatNumber(borrowAfterUsd / collateralAfterUsd, 2, "percent")
      : "";

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
      <div className="flex w-full flex-col justify-between border border-muted px-5 py-2 rounded-xl text-md">
        <span>
          Daily APY:{" "}
          {formatNumber(market.state.dailyNetBorrowApy, 2, "percent")}
        </span>
        <span>
          Weekly APY:{" "}
          {formatNumber(market.state.weeklyNetBorrowApy, 2, "percent")}
        </span>
        <span>
          30-day APY:{" "}
          {formatNumber(market.state.monthlyNetBorrowApy, 2, "percent")}
        </span>
        <br />
        <span>
          Total supply assets: ${formatNumber(market.state.supplyAssetsUsd, 1)}
        </span>
        <span>
          Total borrow assets: ${formatNumber(market.state.borrowAssetsUsd, 1)}
        </span>
        <span>
          Total assets: ${formatNumber(market.state.collateralAssetsUsd, 1)}
        </span>
        <br />
        <span>Your Balances:</span>
        <div className="flex gap-2">
          <span>Collateral:</span>
          <div className="w-6 h-6">
            <img
              width={24}
              height={24}
              src={market.collateralAsset.logoURI}
              alt={market.collateralAsset.symbol}
              title={market.collateralAsset.symbol}
            />
          </div>
          <span>{formattedCollateralBalance}</span>
        </div>
        <div className="flex gap-2">
          <span>Loan:</span>
          <div className="w-6 h-6">
            <img
              width={24}
              height={24}
              src={market.loanAsset.logoURI}
              alt={market.loanAsset.symbol}
              title={market.loanAsset.symbol}
            />
          </div>
          <span>{formattedLoanBalance}</span>
        </div>
        <br />
        <span>Your Positions:</span>
        <div className="flex gap-2">
          <span>Collateral:</span>
          <div className="w-6 h-6">
            <img
              width={24}
              height={24}
              src={market.collateralAsset.logoURI}
              alt={market.collateralAsset.symbol}
              title={market.collateralAsset.symbol}
            />
          </div>
          <span>{formattedCollateral}</span>
        </div>
        <div className="flex gap-2">
          <span>Loan:</span>
          <div className="w-6 h-6">
            <img
              width={24}
              height={24}
              src={market.loanAsset.logoURI}
              alt={market.loanAsset.symbol}
              title={market.loanAsset.symbol}
            />
          </div>
          <span>{borrowFullDecimals}</span>
        </div>
      </div>
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
        label={`Borrow ${market.loanAsset.symbol}`}
        maxName="isMaxBorrow"
        asset={market.loanAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxBorrowableFormatted}
        floatBalance={maxBorrowableFull ?? 0.0}
        fiatBalance={fiatBorrowAmount}
      />
      <div className="flex flex-col gap-2">
        <span className="opacity-60 text-sm mb-[-8px]">Collateral</span>
        <div className="flex gap-2">
          <span>{`${formattedCollateral} -> ${collateralAfterFormatted}`}</span>
        </div>
        <span className="opacity-60 text-sm mb-[-8px]">Borrow</span>
        <div className="flex gap-2">
          <span>{`${formattedBorrow} -> ${borrowAfterFormatted}`}</span>
        </div>
        <span className="opacity-60 text-sm mb-[-8px]">LTV</span>
        <div className="flex gap-2">
          <span>{`${ltvBefore} -> ${ltvAfter} / ${lltv}`}</span>
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
