// import { useIFrameContext } from "@bleu/cow-hooks-ui";
import type { Address, PublicClient } from "viem";
import { morphoAbi } from "@bleu/utils/transactionFactory";
import { MarketUtils } from "@morpho-org/blue-sdk";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { useCallback } from "react";
import useSWR from "swr";

const MORPHO_ADDRESS = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";

interface UserMarketPosition {
  supplyShares: bigint;
  borrow: bigint;
  borrowShares: bigint;
  collateral: bigint;
  totalSupplyAssets: bigint;
  totalSupplyShares: bigint;
  totalBorrowAssets: bigint;
  totalBorrowShares: bigint;
  lastUpdate: bigint;
  fee: bigint;
}

export const useUserMarketPosition = ({
  marketKey,
}: {
  marketKey: `0x${string}`;
}) => {
  const { publicClient, context } = useIFrameContext();

  const fetcher = useCallback(async () => {
    if (!publicClient || !context?.account) throw new Error("missing context");
    return getUserMarketPosition(marketKey, context.account, publicClient);
  }, [publicClient, context?.account, marketKey]);

  const { data } = useSWR<UserMarketPosition>(
    ["getUserMarketPosition", context?.chainId, context?.account, marketKey],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    }
  );
  return data;
};

export const getUserMarketPosition = async (
  marketKey: `0x${string}`,
  userAddress: Address,
  publicClient: PublicClient
): Promise<UserMarketPosition> => {
  const results =
    publicClient &&
    (await publicClient.multicall({
      contracts: [
        {
          address: MORPHO_ADDRESS,
          abi: morphoAbi,
          functionName: "position",
          args: [marketKey, userAddress],
        },
        {
          address: MORPHO_ADDRESS,
          abi: morphoAbi,
          functionName: "market",
          args: [marketKey],
        },
      ],
    }));

  if (results[0].status !== "success")
    throw new Error(`Failed to read market data: ${results[0].error}`);
  if (results[1].status !== "success")
    throw new Error(`Failed to read market data: ${results[1].error}`);

  const [supplyShares, borrowShares, collateral] = results[0].result;
  const [
    totalSupplyAssets,
    totalSupplyShares,
    totalBorrowAssets,
    totalBorrowShares,
    lastUpdate,
    fee,
  ] = results[1].result;

  const borrow = MarketUtils.toBorrowAssets(borrowShares, {
    totalBorrowAssets,
    totalBorrowShares,
  });

  return {
    supplyShares,
    borrow,
    borrowShares,
    collateral,
    totalSupplyAssets,
    totalSupplyShares,
    totalBorrowAssets,
    totalBorrowShares,
    lastUpdate,
    fee,
  };
};
