import { BigNumber } from "ethers";
import { useCallback } from "react";
import useSWR from "swr";
import { type Address, type PublicClient, erc20Abi, zeroAddress } from "viem";
import { useIFrameContext } from "../context/iframe";
import type { HookDappContextAdjusted } from "../types";

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
      return readTokenContract(
        address,
        publicClient,
        context?.account,
        context?.balancesDiff,
      );
    },
    [publicClient, context?.account, context?.balancesDiff],
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
  account: Address,
  balancesDiff?: HookDappContextAdjusted["balancesDiff"],
) => {
  const tokenAddressLowerCase = address.toLowerCase() as Address;
  const tokenBalanceDiff =
    balancesDiff?.[account.toLowerCase()]?.[tokenAddressLowerCase] || "0";

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

  if (!account) {
    return {
      symbol: tokenResults?.[0],
      decimals: tokenResults?.[1],
      balance: undefined,
    };
  }
  const contractBalance = tokenResults?.[2]?.result;

  const balanceWithContextDiff = BigNumber.from(contractBalance)
    .add(BigNumber.from(tokenBalanceDiff ?? 0))
    .toBigInt();

  const balanceResultWithContextDiff = {
    ...tokenResults?.[2],
    result: balanceWithContextDiff,
  };

  return {
    symbol: tokenResults?.[0],
    decimals: tokenResults?.[1],
    balance: balanceResultWithContextDiff,
  };
};
