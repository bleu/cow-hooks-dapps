import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { parseUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { useMorphoContext } from "#/contexts/morpho";
import { getMaxReallocatableLiquidity } from "#/utils/borrowReallocation";

export const useMaxBorrowableAmount = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();
  const { market, supplyAmount } = useWatch({ control }) as {
    market: MorphoMarket | undefined;
    supplyAmount: bigint | undefined;
  };

  const { markets } = useMorphoContext();

  const supplyBigInt =
    market && supplyAmount
      ? BigNumber.from(
          parseUnits(supplyAmount.toString(), market.collateralAsset.decimals),
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

  const maxReallocatableLiquidity =
    market &&
    markets &&
    getMaxReallocatableLiquidity(market, markets).maxReallocatableLiquidity;

  const marketBorrowLimit =
    market &&
    maxReallocatableLiquidity &&
    market.liquidity + maxReallocatableLiquidity;

  const canUserBorrowMaxMarket =
    maxBorrowableAmount &&
    marketBorrowLimit &&
    maxBorrowableAmount > marketBorrowLimit;

  return canUserBorrowMaxMarket ? marketBorrowLimit : maxBorrowableAmount;
};
