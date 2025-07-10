import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useFormatTokenAmount } from "#/hooks/useFormatTokenAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { calculateLLTVWithSafetyMargin } from "#/utils/morpho";
import { useMarketBorrowRate } from "./useMarketBorrowRate";

export const useMaxWithdrawbleAmount = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();

  const { repayAmount, market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket;

  const { collateral, borrowShares } = market.position;

  const borrowRate = useMarketBorrowRate({ market });

  const TIME_BUFFER = 3600;
  const period =
    BigInt(Math.floor(Date.now() / 1000) + TIME_BUFFER) -
    market.onchainState.lastUpdate;

  const compoundRate =
    borrowRate !== undefined
      ? MarketUtils.compoundRate(borrowRate, period)
      : undefined;

  const borrowSharesWithCoumpoundRate =
    compoundRate !== undefined
      ? borrowShares +
        (borrowShares * compoundRate) / BigInt("1000000000000000000")
      : undefined;

  const repay = decimalsToBigInt(repayAmount || "0", market.loanAsset.decimals);

  const repayBorrowShares =
    repay !== undefined
      ? MarketUtils.toBorrowShares(repay, {
          totalBorrowAssets: market.onchainState.totalBorrowAssets,
          totalBorrowShares: market.onchainState.totalBorrowShares,
        })
      : undefined;

  const withdrawableLimitFromRepay =
    repayBorrowShares !== undefined &&
    borrowSharesWithCoumpoundRate !== undefined
      ? MarketUtils.getWithdrawableCollateral(
          {
            collateral,
            borrowShares: borrowSharesWithCoumpoundRate - repayBorrowShares,
          },
          {
            totalBorrowAssets: market.onchainState.totalBorrowAssets,
            totalBorrowShares: market.onchainState.totalBorrowShares,
            price: market.price,
          },
          { lltv: calculateLLTVWithSafetyMargin(market.lltv) },
        )
      : undefined;

  const withdrawableLimit =
    withdrawableLimitFromRepay !== undefined
      ? withdrawableLimitFromRepay > collateral
        ? collateral
        : withdrawableLimitFromRepay
      : undefined;

  const {
    formatted: maxWithdrawableFormatted,
    fullDecimals: maxWithdrawableFull,
  } = useFormatTokenAmount({
    amount: withdrawableLimit,
    decimals: market.collateralAsset.decimals,
  });

  return {
    maxWithdrawableFormatted,
    maxWithdrawableFull,
    withdrawableLimit,
  };
};
