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
    float: collateralBalanceFloat,
    formatted: formattedCollateralBalance,
  } = useFormatTokenAmount({
    amount: collateralBalance,
    decimals: collateralDecimals,
  });

  const { formatted: formattedCollateral } = useFormatTokenAmount({
    amount: collateral,
    decimals: collateralDecimals,
  });

  const { float: floatBorrow } = useFormatTokenAmount({
    amount: borrow,
    decimals: loanDecimals,
  });

  const buttonMessage = useMemo(() => {
    if (context?.hookToEdit && context?.isPreHook)
      return <span>Update Pre-hook</span>;
    if (context?.hookToEdit && !context?.isPreHook)
      return <span>Update Post-hook</span>;
    if (!context?.hookToEdit && context?.isPreHook)
      return <span>Add Pre-hook</span>;
    if (!context?.hookToEdit && !context?.isPreHook)
      return <span>Add Post-hook</span>;
  }, [context?.hookToEdit, context?.isPreHook]);

  const maxBorrowableAmount = useMaxBorrowableAmount();

  const { formatted: maxBorrowableFormatted, float: maxBorrowableFloat } =
    useFormatTokenAmount({
      amount: maxBorrowableAmount,
      decimals: market.loanAsset.decimals,
    });

  useEffect(() => {
    if (isMaxBorrow && maxBorrowableFloat) {
      const newBorrow = String(maxBorrowableFloat);
      setValue("borrowAmount", newBorrow);
    }
  }, [isMaxBorrow, maxBorrowableFloat, setValue]);

  useEffect(() => {
    if (isMaxSupply && collateralBalanceFloat) {
      const newSupply = String(collateralBalanceFloat);
      setValue("supplyAmount", newSupply);
    }
  }, [isMaxSupply, collateralBalanceFloat, setValue]);

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
          <span>{floatBorrow}</span>
        </div>
      </div>
      <AmountInput
        name="supplyAmount"
        label="Supply Collateral"
        maxName="isMaxSupply"
        asset={market.collateralAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={formattedCollateralBalance}
        floatBalance={String(collateralBalanceFloat ?? 0.0)}
        fiatBalance={fiatSupplyAmount}
      />
      <AmountInput
        name="borrowAmount"
        label={`Borrow ${market.loanAsset.symbol}`}
        maxName="isMaxBorrow"
        asset={market.loanAsset}
        chainId={market.oracle.chain.id}
        formattedBalance={maxBorrowableFormatted}
        floatBalance={String(maxBorrowableFloat ?? 0.0)}
        fiatBalance={fiatBorrowAmount}
      />
      <Info content={<InfoContent />} />
      <ButtonPrimary type="submit" className="mb-4">
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
