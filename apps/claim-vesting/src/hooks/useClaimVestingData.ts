import useSWR from "swr";
import { formatUnits, isAddress, type Address } from "viem";
import { VestingEscrowAbi } from "../abis/VestingEscrowAbi";
import { erc20Abi } from "../abis/erc20Abi";

import { mainnet, gnosis, sepolia, arbitrum } from "viem/chains";
import { createPublicClient, http } from "viem";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { useCallback, useEffect, useMemo } from "react";

interface useClaimVestingDataParams {
  chainId: SupportedChainId | undefined;
  account: string | undefined;
  debouncedAddress: string;
}

const chainMapping = {
  [1]: mainnet,
  [100]: gnosis,
  [42161]: arbitrum,
  [11155111]: sepolia,
};

export const useClaimVestingData = ({
  chainId,
  account,
  debouncedAddress,
}: useClaimVestingDataParams): {
  errorMessage: string | undefined;
  formattedClaimableAmount: string;
  tokenSymbol: string;
  loading: boolean;
} => {
  const publicClient = useMemo(
    () =>
      chainId &&
      createPublicClient({
        chain: chainMapping[chainId],
        transport: http(),
      }),
    [chainId]
  );

  /// ---------------- VESTING DATA ---------------- ///

  const readVesting = useCallback(
    async (address: Address) => {
      const vestingContract = {
        address: address,
        abi: VestingEscrowAbi,
      } as const;

      const vestingResults =
        publicClient &&
        (await publicClient.multicall({
          contracts: [
            {
              ...vestingContract,
              functionName: "unclaimed",
            },
            {
              ...vestingContract,
              functionName: "recipient",
            },
            {
              ...vestingContract,
              functionName: "token",
            },
          ],
        }));

      vestingResults?.forEach((result) => {
        const status = result?.status;
        const error = result?.error;

        // When the address is not a vesting contract
        if (
          status === "failure" &&
          error?.name === "ContractFunctionExecutionError"
        )
          throw new Error("Address is not a valid vesting contract");

        // Other unexpected errors
        if (status === "failure") throw new Error("Unexpected error");
      });

      return {
        claimableAmountWei: vestingResults && vestingResults[0],
        recipient: vestingResults && vestingResults[1],
        tokenAddress: vestingResults && vestingResults[2],
      };
    },
    [publicClient]
  );

  const shouldFetchVesting = isAddress(debouncedAddress);

  const {
    data: vestingData,
    isLoading: isLoadingVesting,
    error: errorVesting,
  } = useSWR(shouldFetchVesting ? debouncedAddress : null, readVesting, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });

  const claimableAmountWei = vestingData?.claimableAmountWei?.result;
  const recipient = vestingData?.recipient?.result;
  const tokenAddress = vestingData?.tokenAddress?.result;

  /// ---------------- TOKEN DATA ---------------- ///

  const readToken = useCallback(
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

      tokenResults?.forEach((result) => {
        // Unexpected errors with token
        if (result.status === "failure") throw new Error("Unexpected error");
      });

      return {
        symbol: tokenResults && tokenResults[0],
        decimals: tokenResults && tokenResults[1],
      };
    },
    [publicClient]
  );

  const {
    data: tokenData,
    isLoading: isLoadingToken,
    error: errorToken,
  } = useSWR(tokenAddress ? tokenAddress : null, readToken, {
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

  /// -------------------------------------------- ///

  const errorMessage = getErrorMessage({
    debouncedAddress,
    account,
    recipient,
    errorVesting,
    errorToken,
  });
  const formattedClaimableAmount =
    claimableAmountWei && decimals
      ? formatUnits(claimableAmountWei, Number(decimals))
      : "0.0";
  const loading = isLoadingToken || isLoadingVesting;
  return { errorMessage, formattedClaimableAmount, tokenSymbol, loading };
};

function getErrorMessage({
  account,
  recipient,
  errorVesting,
  debouncedAddress,
  errorToken,
}: {
  account: string | undefined;
  recipient: string | undefined;
  debouncedAddress: string;
  errorVesting: Error;
  errorToken: Error;
}) {
  if (!(isAddress(debouncedAddress) || debouncedAddress === ""))
    return "Insert a valid Ethereum address";

  if (!account) return "Please connect your wallet first";

  if (recipient && account !== recipient)
    return "You are not the contract recipient";

  if (errorVesting) return errorVesting.message;

  if (errorToken) return errorToken.message;

  return undefined;
}
