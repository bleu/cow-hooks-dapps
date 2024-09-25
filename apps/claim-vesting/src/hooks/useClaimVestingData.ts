import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { useMemo } from "react";
import useSWR from "swr";
import { type Address, formatUnits, isAddress } from "viem";
import { encodeFunctionData } from "viem";
import { http, createPublicClient } from "viem";
import { arbitrum, gnosis, mainnet, sepolia } from "viem/chains";
import { VestingEscrowAbi } from "../abis/VestingEscrowAbi";
import { useReadToken } from "./useReadToken";
import { useReadVesting } from "./useReadVesting";

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
  callData: string | undefined;
  gasLimit: string | undefined;
} => {
  const publicClient = useMemo(
    () =>
      chainId &&
      createPublicClient({
        chain: chainMapping[chainId],
        transport: http(),
      }),
    [chainId],
  );

  const {
    claimableAmountWei,
    recipient,
    tokenAddress,
    isLoadingVesting,
    errorVesting,
  } = useReadVesting({ publicClient, debouncedAddress });

  const { tokenSymbol, decimals, isLoadingToken, errorToken } = useReadToken({
    publicClient,
    tokenAddress,
  });

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

  const callData =
    recipient && claimableAmountWei
      ? encodeFunctionData({
          abi: VestingEscrowAbi,
          functionName: "claim",
          args: [recipient, claimableAmountWei],
        })
      : undefined;

  const estimateGasLimit = async ({
    recipient,
    claimableAmountWei,
  }: {
    recipient: Address;
    claimableAmountWei: bigint;
  }) => {
    const result = publicClient
      ? await publicClient.estimateContractGas({
          address: debouncedAddress as Address,
          abi: VestingEscrowAbi,
          functionName: "claim",
          args: [recipient, claimableAmountWei],
        })
      : undefined;

    return result;
  };

  const {
    data: gasLimit,
    isLoading: isLoadingGasLimit,
    error: errorGasLimit,
  } = useSWR(
    recipient && claimableAmountWei ? { recipient, claimableAmountWei } : null,
    estimateGasLimit,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  );
  const stringGasLimit = gasLimit ? String(gasLimit) : undefined;

  return {
    errorMessage,
    formattedClaimableAmount,
    tokenSymbol,
    loading,
    callData,
    gasLimit: stringGasLimit,
  };
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
