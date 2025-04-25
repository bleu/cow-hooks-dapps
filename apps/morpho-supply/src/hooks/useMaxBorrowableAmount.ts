import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { formatTokenAmount } from "#/utils/formatTokenAmout";
import { useBorrowReallocation } from "./useBorrowReallocation";

export const useMaxBorrowableAmount = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();
  const { supplyAmount, market: selectedMarket } = useWatch({ control });
  const market = selectedMarket as MorphoMarket | undefined;

  const { maxBorrowReallocation } = useBorrowReallocation(market);

  const marketBorrowLimit =
    market && maxBorrowReallocation && market.liquidity + maxBorrowReallocation;

  const supplyBigInt =
    market && supplyAmount
      ? BigNumber.from(
          parseUnits(
            formatTokenAmount(supplyAmount, { compact: true }),
            market.collateralAsset.decimals,
          ),
        ).toBigInt()
      : BigInt(0);

  const lltv = market && (market.lltv * BigInt(9500)) / BigInt(10000);

  const maxBorrowableAmount = useMemo(() => {
    if (!lltv) return;
    const { totalBorrowAssets, totalBorrowShares } = market.onchainState;
    const { collateral, borrowShares } = market.position;

    return MarketUtils.getMaxBorrowableAssets(
      { collateral: collateral + supplyBigInt, borrowShares },
      {
        totalBorrowAssets,
        totalBorrowShares,
        price: market.price,
      },
      {
        lltv,
      },
    );
  }, [market, lltv, supplyBigInt]);

  const canUserBorrowMaxMarket =
    maxBorrowableAmount &&
    marketBorrowLimit &&
    maxBorrowableAmount > marketBorrowLimit;

  return canUserBorrowMaxMarket ? marketBorrowLimit : maxBorrowableAmount;
};
