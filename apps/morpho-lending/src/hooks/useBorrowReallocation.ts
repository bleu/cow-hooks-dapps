import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import { useMorphoContext } from "#/contexts/morpho";
import {
  getMaxBorrowReallocation,
  getPossibleReallocations,
} from "#/utils/borrowReallocation";

export const useBorrowReallocation = (market: MorphoMarket | undefined) => {
  const { allMarkets } = useMorphoContext();

  const possibleReallocations = useMemo(
    () => market && allMarkets && getPossibleReallocations(market, allMarkets),
    [market, allMarkets],
  );

  const maxBorrowReallocation = useMemo(
    () =>
      possibleReallocations
        ? getMaxBorrowReallocation(possibleReallocations)
        : undefined,
    [possibleReallocations],
  );

  return { possibleReallocations, maxBorrowReallocation };
};
