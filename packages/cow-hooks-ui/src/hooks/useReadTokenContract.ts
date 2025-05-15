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
        context.orderParams,
        context.isPreHook,
      );
    },
    [publicClient, context?.account, context?.orderParams, context?.isPreHook],
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
  orderParams: HookDappContextAdjusted["orderParams"],
  isPreHook: boolean,
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

  if (!account) {
    return {
      symbol: tokenResults?.[0],
      decimals: tokenResults?.[1],
      balance: undefined,
    };
  }

  if (isPreHook || !orderParams)
    return {
      symbol: tokenResults?.[0],
      decimals: tokenResults?.[1],
      balance: tokenResults?.[2],
    };

  const buyToken = orderParams.buyTokenAddress.toLowerCase();
  const sellToken = orderParams.sellTokenAddress.toLowerCase();
  const buyAmount = BigInt(orderParams.buyAmount);
  const sellAmount = BigInt(orderParams.sellAmount);

  if (buyToken === address.toLowerCase()) {
    return {
      symbol: tokenResults?.[0],
      decimals: tokenResults?.[1],
      balance:
        tokenResults?.[2]?.status === "success"
          ? {
              status: "success",
              result: BigNumber.from(tokenResults?.[2].result)
                .add(buyAmount)
                .toBigInt(),
            }
          : tokenResults?.[2],
    };
  }

  if (sellToken === address.toLowerCase()) {
    return {
      symbol: tokenResults?.[0],
      decimals: tokenResults?.[1],
      balance:
        tokenResults?.[2]?.status === "success"
          ? {
              status: "success",
              result:
                sellAmount > tokenResults?.[2].result
                  ? BigInt(0)
                  : BigNumber.from(tokenResults?.[2].result)
                      .sub(sellAmount)
                      .toBigInt(),
            }
          : tokenResults?.[2],
    };
  }

  return {
    symbol: tokenResults?.[0],
    decimals: tokenResults?.[1],
    balance: tokenResults?.[2],
  };
};
