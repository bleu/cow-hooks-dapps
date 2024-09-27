import { useCallback } from "react";
import useSWR from "swr";
import type { Address, PublicClient } from "viem";
import { erc20Abi } from "#/abis/erc20Abi";

export const useReadTokenContract = ({
  publicClient,
  tokenAddress,
}: {
  publicClient: PublicClient | undefined;
  tokenAddress: Address | undefined;
}) => {
  const readTokenContract = useCallback(
    async (address: Address) => {
      const tokenContract = {
        address: address,
        abi: erc20Abi,
      } as const;

      const tokenResults =
        publicClient &&
        (await publicClient.multicall({
          contracts: [
            {
              ...tokenContract,
              functionName: "symbol",
            },
            {
              ...tokenContract,
              functionName: "decimals",
            },
          ],
        }));

      for (const result of tokenResults ?? []) {
        // Unexpected errors with token
        if (result.status === "failure") throw new Error("Unexpected error");
      }

      return {
        symbol: tokenResults?.[0],
        decimals: tokenResults?.[1],
      };
    },
    [publicClient],
  );

  const {
    data: tokenData,
    isLoading: isLoadingToken,
    error: errorToken,
  } = useSWR(tokenAddress ? tokenAddress : null, readTokenContract, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  const tokenSymbol = tokenData?.symbol?.result
    ? String(tokenData.symbol.result)
    : "";
  const decimals = tokenData?.decimals?.result;

  return { tokenSymbol, decimals, isLoadingToken, errorToken };
};
