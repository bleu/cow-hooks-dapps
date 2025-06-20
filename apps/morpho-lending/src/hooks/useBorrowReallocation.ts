import { type MorphoMarket, useIFrameContext } from "@bleu/cow-hooks-ui";
import { useMemo } from "react";
import useSWR from "swr";
import { useMorphoContext } from "#/contexts/morpho";
import {
  getMaxBorrowReallocation,
  getPossibleReallocations,
} from "#/utils/borrowReallocation";

export const useBorrowReallocation = (market: MorphoMarket | undefined) => {
  const { context, publicClient } = useIFrameContext();
  const { markets } = useMorphoContext();

  const { data: possibleReallocations } = useSWR(
    [market, markets, publicClient, context?.chainId],
    async () => {
      if (!market || !markets || !publicClient || !context?.chainId) return;
      return getPossibleReallocations(market, markets);
    },
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
