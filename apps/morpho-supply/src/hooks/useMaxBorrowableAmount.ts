import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { getMaxReallocatableLiquidity } from "#/utils/borrowReallocation";
import { getMarketParams } from "#/utils/getMarketParams";
import { useReadPrice } from "./useReadPrice";
import { useUserMarketPosition } from "./useUserMarketPosition";

export const useMaxBorrowableAmount = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();
  const { market, supplyAmount } = useWatch({ control });

  const { markets } = useMorphoContext();

  const supplyBigInt =
    market && supplyAmount
      ? BigNumber.from(
          parseUnits(
            supplyAmount.toString(),
            (market as MorphoMarket).collateralAsset.decimals,
          ),
        ).toBigInt()
      : BigInt(0);

  const lltv =
    market && ((market as MorphoMarket).lltv * BigInt(9500)) / BigInt(10000);
  const data = useUserMarketPosition({
    marketKey: (market as MorphoMarket).uniqueKey,
    marketParams: getMarketParams(market as MorphoMarket),
  });

  const price = useReadPrice();

  const maxBorrowableAmount = useMemo(() => {
    if (!data || !lltv) return;
    const { totalBorrowAssets, totalBorrowShares, collateral, borrowShares } =
      data;

    return MarketUtils.getMaxBorrowableAssets(
      { collateral: collateral + supplyBigInt, borrowShares },
      {
        totalBorrowAssets,
        totalBorrowShares,
        price,
      },
      {
        lltv,
      },
    );
  }, [data, lltv, price, supplyBigInt]);

  const maxReallocatableLiquidity =
    market &&
    markets &&
    getMaxReallocatableLiquidity(market as MorphoMarket, markets)
      .maxReallocatableLiquidity;

  const marketBorrowLimit =
    market &&
    maxReallocatableLiquidity &&
    (market as MorphoMarket).state.liquidityAssets + maxReallocatableLiquidity;

  const canUserBorrowMaxMarket =
    maxBorrowableAmount &&
    marketBorrowLimit &&
    maxBorrowableAmount > marketBorrowLimit;

  return canUserBorrowMaxMarket ? marketBorrowLimit : maxBorrowableAmount;
};
