import { formatNumber } from "@bleu.builders/ui";
import { Token } from "@uniswap/sdk-core";

import {
  ButtonPrimary,
  Info,
  InfoContent,
  type MorphoMarket,
  TokenAmountInput,
  useIFrameContext,
  useReadTokenContract,
} from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useFormatTokenAmount } from "#/hooks/useFormatTokenAmount";
import { useUserMarketPosition } from "#/hooks/useUserMarketPosition";

export function MarketForm({ market }: { market: MorphoMarket }) {
  const { context } = useIFrameContext();

  const { control } = useFormContext<MorphoSupplyFormData>();
  const { amount } = useWatch({ control });
  const fiatAmount = amount
    ? `~${formatNumber(Number(amount) * market.collateralAsset.priceUsd, 2, "currency", "standard")}`
    : "~$0.0";

  const { userBalance: loanBalance, tokenDecimals: loanDecimals } =
    useReadTokenContract({
      tokenAddress: market.loanAsset.address,
    });

  const { userBalance: collateralBalance, tokenDecimals: collateralDecimals } =
    useReadTokenContract({
      tokenAddress: market.collateralAsset.address,
    });

  const { borrow, collateral } = useUserMarketPosition({
    marketKey: market.uniqueKey,
  }) ?? {
    borrow: undefined,
    collateral: undefined,
  };

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

  const { formatted: formattedBorrow } = useFormatTokenAmount({
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

  if (!context) return null;

  const handleSetValue = (value: string) => {
    if (value === "") return undefined;
    if (typeof value === "number") return value;

    let v = value;
    v = v.replace(",", ".");
    const inputedDecimals = v.includes(".") && v.split(".").at(-1);
    if (
      inputedDecimals &&
      inputedDecimals.length > market.collateralAsset.decimals
    )
      return Number(
        v.slice(0, -(inputedDecimals.length - market.collateralAsset.decimals)),
      );
    return Number(v);
  };

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
          <span>{formattedBorrow}</span>
        </div>
      </div>
      <TokenAmountInput
        name="collateralAmount"
        type="number"
        inputMode="decimal"
        step={`0.${"0".repeat(market.collateralAsset.decimals - 1)}1`}
        max="1000000000000"
        token={
          new Token(
            market.oracle.chain.id,
            market.collateralAsset.address,
            market.collateralAsset.decimals,
            market.collateralAsset.symbol,
          )
        }
        label="Supply Collateral"
        placeholder="0.0"
        autoComplete="off"
        disabled={false}
        userBalance={formattedCollateralBalance}
        userBalanceFullDecimals={String(collateralBalanceFloat)}
        fiatAmount={fiatAmount}
        shouldEnableMaxSelector={true}
        validation={{ setValueAs: handleSetValue }}
        onKeyDown={(e) =>
          ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
        }
      />
      <TokenAmountInput
        name="borrowAmount"
        type="number"
        inputMode="decimal"
        step={`0.${"0".repeat(market.loanAsset.decimals - 1)}1`}
        max="1000000000000"
        token={
          new Token(
            market.oracle.chain.id,
            market.loanAsset.address,
            market.loanAsset.decimals,
            market.loanAsset.symbol,
          )
        }
        label={`Borrow ${market.loanAsset.symbol}`}
        placeholder="0.0"
        autoComplete="off"
        disabled={false}
        userBalance={formattedCollateralBalance}
        userBalanceFullDecimals={String(collateralBalanceFloat)}
        fiatAmount={fiatAmount}
        shouldEnableMaxSelector={true}
        validation={{ setValueAs: handleSetValue }}
        onKeyDown={(e) =>
          ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
        }
      />
      <Info content={<InfoContent />} />
      <ButtonPrimary type="submit" className="mb-0">
        {buttonMessage}
      </ButtonPrimary>
    </div>
  );
}
