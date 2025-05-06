import { Skeleton, cn } from "@bleu.builders/ui";
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
  isChanging: boolean;
  isLoading?: boolean;
}

export function PositionSummary({
  market,
  formattedCollateral,
  formattedBorrow,
  collateralAfterFormatted,
  borrowAfterFormatted,
  ltvBefore,
  ltvAfter,
  lltv,
  shouldRenderAfter,
  isChanging,
  isLoading,
}: PositionSummaryProps) {
  return (
    <div className="flex flex-col gap-2 w-full min-h-24 pt-4 pb-1 px-6 bg-color-paper-darker rounded-xl items-start">
      <span className="opacity-60 text-sm mb-[-8px] font-medium">
        Your collateral position ({market.collateralAsset.symbol})
      </span>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Skeleton className="w-12 h-4 bg-color-paper" />
        ) : (
          <span
            className={cn("font-semibold", {
              "opacity-70": isChanging,
            })}
          >
            {formattedCollateral}
          </span>
        )}
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
        {isLoading ? (
          <Skeleton className="w-12 h-4 bg-color-paper" />
        ) : (
          <span
            className={cn("font-semibold", {
              "opacity-70": isChanging,
            })}
          >
            {formattedBorrow}
          </span>
        )}
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
        {isLoading ? (
          <Skeleton className="w-12 h-4 bg-color-paper" />
        ) : (
          <span
            className={cn("font-semibold", {
              "opacity-70": isChanging,
            })}
          >
            {ltvBefore}
          </span>
        )}
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
