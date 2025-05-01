import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useFormatTokenAmount } from "#/hooks/useFormatTokenAmount";
import { decimalsToBigInt } from "#/utils/decimalsToBigInt";
import { calculateLLTVWithSafetyMargin } from "#/utils/morpho";

export const useMaxWithdrawbleAmount = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();

  const { repayAmount, market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket;

  const { collateral, borrowShares } = market.position;

  const repay = decimalsToBigInt(repayAmount || 0, market.loanAsset.decimals);

  const borrowSharesAfterRepay =
    repay !== undefined
      ? MarketUtils.toBorrowShares(repay, {
          totalBorrowAssets: market.onchainState.totalBorrowAssets,
          totalBorrowShares: market.onchainState.totalBorrowShares,
        })
      : undefined;

  const withdrawableLimit =
    borrowSharesAfterRepay !== undefined
      ? MarketUtils.getWithdrawableCollateral(
          {
            collateral,
            borrowShares: borrowShares - borrowSharesAfterRepay,
          },
          {
            totalBorrowAssets: market.onchainState.totalBorrowAssets,
            totalBorrowShares: market.onchainState.totalBorrowShares,
            price: market.price,
          },
          { lltv: calculateLLTVWithSafetyMargin(market.lltv) },
        )
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
  };
};
