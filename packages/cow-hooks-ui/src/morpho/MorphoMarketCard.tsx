"use client";

import { cn, formatNumber } from "@bleu.builders/ui";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { formatUnits } from "viem";
import { hasPosition } from "../hooks/useMorphoMarkets";
import type { MorphoMarket } from "../types";
import { HealthBar } from "./HealthBar";
import { Label } from "./Label";
import { TokenCard } from "./TokenCard";

export function MorphoMarketCard({ market }: { market: MorphoMarket }) {
  const userHasPosition = hasPosition(market.position);
  const rate = formatNumber(
    market.state.monthlyNetBorrowApy,
    2,
    "percent",
    "standard",
  );

  const lltvFloat = Number(market.lltv.toString().slice(0, 3)) / 1000;

  const lltv = formatNumber(lltvFloat, 1, "percent");

  const userCollateral = userHasPosition
    ? formatNumber(
        formatUnits(
          market.position.collateral,
          market.collateralAsset.decimals,
        ),
        4,
        "decimal",
        "standard",
        0.0001,
      )
    : undefined;

  const userBorrow = userHasPosition
    ? formatNumber(
        formatUnits(market.position.borrow, market.loanAsset.decimals),
        4,
        "decimal",
        "standard",
        0.0001,
      )
    : undefined;

  const userLtvFloat = userHasPosition
    ? ((Number(market.position.borrow) / 10 ** market.loanAsset.decimals) *
        market.loanAsset.priceUsd) /
      ((Number(market.position.collateral) /
        10 ** market.collateralAsset.decimals) *
        market.collateralAsset.priceUsd)
    : undefined;
  const userLtv =
    userHasPosition && userLtvFloat
      ? formatNumber(userLtvFloat, 2, "percent")
      : undefined;

  const liquidity = formatNumber(market.liquidityUsd, 1);

  return (
    <div className="w-full flex justify-between rounded-2xl p-4 cursor-pointer bg-color-paper-darker hover:bg-color-paper-darkest hover:text-muted-foreground transition-all">
      <div className="flex justify-between min-w-44">
        <div className="flex flex-col gap-1">
          <Label>Collateral</Label>
          {userCollateral && <span>{userCollateral}</span>}
          <TokenCard
            asset={market.collateralAsset}
            className={cn({ "bg-inherit p-0": userHasPosition })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Loan</Label>
          {userBorrow && <span>{userBorrow}</span>}
          <TokenCard
            asset={market.loanAsset}
            className={cn({ "bg-inherit p-0": userHasPosition })}
          />
        </div>
      </div>
      <div className="col-span-1 w-[1px] h-inherit bg-color-text-paper opacity-20 mx-3" />
      <div className="w-full grid grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label>Rate</Label>
          <span className="font-semibold text-sm">{rate}</span>
        </div>
        {userLtv && userLtvFloat ? (
          <div className="col-span-2 flex flex-col gap-1">
            <Label>Health</Label>
            <span className="font-semibold text-sm">
              {userLtv} / {lltv}
            </span>
            <HealthBar health={(userLtvFloat / lltvFloat) * 100} />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <Label>LLTV</Label>
              <span className="font-semibold text-sm">{lltv}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Liquidity</Label>
              <span className="font-semibold text-sm">{liquidity}</span>
            </div>
          </>
        )}
      </div>
      <Link
        href={`https://app.morpho.org/${market.oracle.chain.network}/${market.uniqueKey}`}
        target="_blank"
        title="Market details"
      >
        <div className="h-full flex items-center justify-center ml-2">
          <ExternalLinkIcon className="size-4 shrink-0 bg-inherit opacity-70 hover:opacity-100 transition-all" />
        </div>
      </Link>
    </div>
  );
}
