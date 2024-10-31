import { useCallback } from "react";
import useSWR from "swr";
import { type Address, erc20Abi, PublicClient, zeroAddress } from "viem";
import { useIFrameContext } from "../context/iframe";

export const useReadTokenContract = ({
  tokenAddress,
}: {
  tokenAddress: Address | undefined;
}) => {
  const { publicClient, context } = useIFrameContext();
  const tokenAddressLowerCase = tokenAddress?.toLowerCase();

  const _readTokenContract = useCallback(
    async (address: Address) => {
      if (!publicClient || !context?.account) return;
      return readTokenContract(address, publicClient, context?.account);
    },
    [publicClient, context?.account]
  );

  const {
    data: tokenData,
    isLoading: isLoadingToken,
    error: errorToken,
  } = useSWR(tokenAddressLowerCase, _readTokenContract, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  const tokenSymbol = tokenData?.symbol?.result
    ? String(tokenData.symbol.result)
    : "";
  const tokenDecimals = tokenData?.decimals?.result;
  const userBalance = tokenData?.balance?.result;

  return {
    tokenSymbol,
    tokenDecimals,
    userBalance,
    isLoadingToken,
    errorToken,
  };
};

export const readTokenContract = async (
  address: Address,
  publicClient: PublicClient,
  account: Address
) => {
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
        {
          ...tokenContract,
          functionName: "balanceOf",
          args: [account ?? zeroAddress],
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
    balance: account ? tokenResults?.[2] : undefined,
  };
};
