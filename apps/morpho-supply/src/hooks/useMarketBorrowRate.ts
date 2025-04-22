import { type MorphoMarket, useIFrameContext } from "@bleu/cow-hooks-ui";
import { morphoIrmAbi } from "@bleu/utils/transactionFactory";
import { useCallback } from "react";
import useSWR from "swr";
import type { PublicClient } from "viem";
import { getMarketParams } from "#/utils/getMarketParams";

export const useMarketBorrowRate = ({ market }: { market: MorphoMarket }) => {
  const { publicClient } = useIFrameContext();

  const fetcher = useCallback(async () => {
    if (!publicClient) throw new Error("missing context");
    return getBorrowRate(market, publicClient);
  }, [publicClient, market]);

  const { data } = useSWR<bigint>(["getUserMarketPosition", market], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });
  return data;
};

export const getBorrowRate = async (
  market: MorphoMarket,
  publicClient: PublicClient,
): Promise<bigint> => {
  const marketParams = getMarketParams(market);

  const borrowRate = await publicClient.readContract({
    address: marketParams.irm,
    abi: morphoIrmAbi,
    functionName: "borrowRateView",
    args: [{ ...marketParams }, market.onchainState],
  });

  return borrowRate;
};
