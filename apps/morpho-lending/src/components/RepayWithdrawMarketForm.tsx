import { cn, formatNumber } from "@bleu.builders/ui";

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
import { useMaxRepayableAmount } from "#/hooks/useMaxRepayableAmount";
import { useMaxWithdrawbleAmount } from "#/hooks/useMaxWithdrawbleAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { isZeroOrEmpty } from "#/utils/isZeroOrEmpty";
import { AmountInput } from "./AmoutIntput";
import { PositionSummary } from "./PositionSummary";

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

  const fiatRepayAmount =
    repayAmount && market.loanAsset.priceUsd && !isZeroOrEmpty(repayAmount)
      ? Number(repayAmount) * market.loanAsset.priceUsd < 0.01
        ? "≈ $< 0.01"
        : `≈ ${formatNumber(Number(repayAmount) * market.loanAsset.priceUsd, 2, "currency", "standard")}`
      : "";

  const fiatWithdrawAmount =
    withdrawAmount &&
    market.collateralAsset.priceUsd &&
    !isZeroOrEmpty(withdrawAmount)
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

  const {
    maxRepayable,
    formatted: maxRepayableFormatted,
    fullDecimals: maxRepayableFull,
  } = useMaxRepayableAmount(borrowedBalance);

  const {
    formatted: formattedCollateral,
    usd: collateralUsd,
    fullDecimals: collateralFloat,
  } = useFormatTokenAmount({
    amount: collateral,
    decimals: market.collateralAsset.decimals,
    priceUsd: market.collateralAsset.priceUsd,
  });

  const {
    formatted: formattedBorrow,
    usd: borrowUsd,
    fullDecimals: borrowFloat,
  } = useFormatTokenAmount({
    amount: dynamicBorrow,
    decimals: market.loanAsset.decimals,
    priceUsd: market.loanAsset.priceUsd,
  });

  useEffect(() => {
    if (isMaxWithdraw && maxWithdrawableFull) {
      const newWithdraw = maxWithdrawableFull;
      setValue("withdrawAmount", newWithdraw);
    }
  }, [isMaxWithdraw, maxWithdrawableFull, setValue]);

  useEffect(() => {
    if (isMaxRepay && maxRepayableFull) {
      const newRepay = maxRepayableFull;
      setValue("repayAmount", newRepay);
    }
  }, [isMaxRepay, maxRepayableFull, setValue]);

  const borrowAfter = useMemo(() => {
    // If isMaxRepay is true, borrowAfter should be 0
    if (isMaxRepay && maxRepayable !== borrowedBalance) {
      return BigInt(0);
    }

    // Calculate normally only if not using max repay
    const repay = decimalsToBigInt(
      repayAmount || "0",
      market.loanAsset.decimals,
    );
    return repay && dynamicBorrow ? dynamicBorrow - repay : dynamicBorrow;
  }, [
    dynamicBorrow,
    market.loanAsset.decimals,
    repayAmount,
    isMaxRepay,
    borrowedBalance,
    maxRepayable,
  ]);

  const {
    formatted: borrowAfterFormatted,
    usd: borrowAfterUsd,
    fullDecimals: borrowAfterFloat,
  } = useFormatTokenAmount({
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

  const {
    formatted: collateralAfterFormatted,
    usd: collateralAfterUsd,
    fullDecimals: collateralAfterFloat,
  } = useFormatTokenAmount({
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
    maxRepayable !== undefined &&
      repayAmountBigInt !== undefined &&
      repayAmountBigInt > maxRepayable,
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

  const shouldRenderAfter =
    !isZeroOrEmpty(repayAmount) || !isZeroOrEmpty(withdrawAmount);

  const buttonMessage = useMemo(() => {
    if (dynamicBorrow === undefined) return "Loading...";

    if (isInsufficientBalance)
      return `Insufficient ${market.loanAsset.symbol} Balance`;

    if (isInsufficientPosition)
      return `Insufficient ${market.collateralAsset.symbol} Balance`;

    if (isOverRepay) return "Repay exceeds borrow";

    if (isZeroOrEmpty(repayAmount) && isZeroOrEmpty(withdrawAmount))
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
    dynamicBorrow,
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
      <PositionSummary
        market={market}
        collateralFloat={collateralFloat}
        formattedCollateral={formattedCollateral}
        borrowFloat={borrowFloat}
        formattedBorrow={formattedBorrow}
        collateralAfterFloat={collateralAfterFloat}
        borrowAfterFloat={borrowAfterFloat}
        collateralAfterFormatted={collateralAfterFormatted}
        borrowAfterFormatted={borrowAfterFormatted}
        ltvBefore={ltvBefore}
        ltvAfter={ltvAfter}
        lltv={lltv}
        shouldRenderAfter={shouldRenderAfter}
        isChanging={Boolean(
          !isZeroOrEmpty(repayAmount) || !isZeroOrEmpty(withdrawAmount),
        )}
      />
      <Info content={<InfoContent />} />
      <ButtonPrimary
        type="submit"
        className={cn(
          "mb-4",
          String(buttonMessage).length > 32 ? " xsm:text-sm" : "",
        )}
        disabled={
          dynamicBorrow === undefined ||
          isInsufficientBalance ||
          isInsufficientPosition ||
          isOverRepay ||
          (isZeroOrEmpty(repayAmount) && isZeroOrEmpty(withdrawAmount))
        }
      >
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
