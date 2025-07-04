import { cn } from "@bleu.builders/ui";
import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { ArrowRightIcon } from "@radix-ui/react-icons";

interface PositionSummaryProps {
  market: MorphoMarket;
  formattedCollateral: string;
  formattedBorrow: string;
  collateralAfterFormatted: string;
  borrowAfterFormatted: string;
  ltvBefore: string;
  ltvAfter: string;
  lltv: string;
  shouldRenderAfter: boolean;
  collateralFloat: string;
  borrowFloat: string;
  collateralAfterFloat: string;
  borrowAfterFloat: string;
  isChanging: boolean;
}

export function PositionSummary({
  market,
  collateralFloat,
  borrowFloat,
  formattedCollateral,
  formattedBorrow,
  collateralAfterFloat,
  borrowAfterFloat,
  collateralAfterFormatted,
  borrowAfterFormatted,
  ltvBefore,
  ltvAfter,
  lltv,
  shouldRenderAfter,
  isChanging,
}: PositionSummaryProps) {
  return (
    <div className="flex flex-col gap-2 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker/60 rounded-xl items-start">
      <span className="opacity-60 text-sm mb-[-8px] font-medium">
        Your collateral position ({market.collateralAsset.symbol})
      </span>
      <div className="flex items-center gap-2">
        <span
          title={collateralFloat}
          className={cn("font-semibold", {
            "opacity-70": isChanging,
          })}
        >
          {formattedCollateral}
        </span>
        {shouldRenderAfter && (
          <>
            <ArrowRightIcon className="w-5 h-5 opacity-70" />
            <span title={collateralAfterFloat} className="font-semibold">
              {collateralAfterFormatted}
            </span>
          </>
        )}
      </div>
      <span className="opacity-60 text-sm mb-[-8px] font-medium">
        Your loan position ({market.loanAsset.symbol})
      </span>
      <div className="flex items-center gap-2">
        <span
          title={borrowFloat}
          className={cn("font-semibold", {
            "opacity-70": isChanging,
          })}
        >
          {formattedBorrow}
        </span>
        {shouldRenderAfter && (
          <>
            <ArrowRightIcon className="w-5 h-5 opacity-70" />
            <span title={borrowAfterFloat} className="font-semibold">
              {borrowAfterFormatted}
            </span>
          </>
        )}
      </div>
      <span className="opacity-60 text-sm mb-[-8px] font-medium">
        LTV / Liquidation LTV
      </span>
      <div className="flex items-center gap-2">
        <span
          className={cn("font-semibold", {
            "opacity-70": isChanging,
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
  );
}
