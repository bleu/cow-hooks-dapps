import { MarketUtils } from "@morpho-org/blue-sdk";
import { useUserMarketPosition } from "./useUserMarketPosition";
import { getMarketParams } from "#/utils/getMarketParams";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { MorphoSupplyFormData } from "#/contexts/form";
import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { useReadPrice } from "./useReadPrice";

export const useMaxBorrowableAmount = () => {
  const { control } = useFormContext<MorphoSupplyFormData>();
  const { market } = useWatch({ control });

  const lltv =
    market &&
    (BigInt((market as MorphoMarket).lltv) * BigInt(9500)) / BigInt(10000);
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
      { collateral, borrowShares },
      {
        totalBorrowAssets,
        totalBorrowShares,
        price,
      },
      {
        lltv,
      }
    );
  }, [data, lltv, price]);

  return maxBorrowableAmount;
};
