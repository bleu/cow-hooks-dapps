import { formatNumber } from "@bleu.builders/ui";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { useMemo } from "react";
import { type Address, isAddress } from "viem";
import { encodeFunctionData } from "viem";
import { http, createPublicClient } from "viem";
import { arbitrum, gnosis, mainnet, sepolia } from "viem/chains";
import { VestingEscrowAbi } from "../abis/VestingEscrowAbi";
import { useEstimateGasLimit } from "./useEstimateGasLimit";
import { useReadTokenContract } from "./useReadTokenContract";
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
  formattedClaimableAmountFullDecimals: string;
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
    [chainId]
  );
  const {
    claimableAmountWei,
    recipient,
    tokenAddress,
    isLoadingVesting,
    errorVesting,
  } = useReadVesting({ publicClient, debouncedAddress });

  const { tokenSymbol, decimals, isLoadingToken, errorToken } =
    useReadTokenContract({
      publicClient,
      tokenAddress,
    });

  const estimateGasParams =
    recipient && claimableAmountWei
      ? {
          address: debouncedAddress as Address,
          abi: VestingEscrowAbi,
          functionName: "claim",
          args: [recipient, claimableAmountWei],
        }
      : undefined;
  const { gasLimit, isLoadingGasLimit, errorGasLimit } = useEstimateGasLimit({
    publicClient,
    estimateGasParams,
    useSWRConfig: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const errorMessage = getErrorMessage({
    debouncedAddress,
    account,
    recipient,
    errorVesting,
    errorToken,
    errorGasLimit,
    claimableAmountWei,
  });
  const formattedClaimableAmount =
    recipient === account && claimableAmountWei && decimals
      ? formatNumber(
          Number(claimableAmountWei) / 10 ** Number(decimals),
          6,
          "decimal",
          "standard",
          0.000001
        )
      : "0.0";
  const formattedClaimableAmountFullDecimals =
    recipient === account && claimableAmountWei && decimals
      ? formatNumber(
          Number(claimableAmountWei) / 10 ** Number(decimals),
          Number(decimals),
          "decimal",
          "standard",
          Number(`0.${"0".repeat(Number(decimals) - 1)}1`)
        )
      : "0.0";
  const loading = isLoadingToken || isLoadingVesting || isLoadingGasLimit;

  const callData =
    recipient && claimableAmountWei
      ? encodeFunctionData({
          abi: VestingEscrowAbi,
          functionName: "claim",
          args: [recipient, claimableAmountWei],
        })
      : undefined;

  return {
    errorMessage,
    formattedClaimableAmount,
    formattedClaimableAmountFullDecimals,
    tokenSymbol,
    loading,
    callData,
    gasLimit,
  };
};

function getErrorMessage({
  account,
  recipient,
  errorVesting,
  debouncedAddress,
  errorToken,
  errorGasLimit,
  claimableAmountWei,
}: {
  account: string | undefined;
  recipient: string | undefined;
  debouncedAddress: string;
  errorVesting: Error;
  errorToken: Error;
  errorGasLimit: Error;
  claimableAmountWei: bigint | undefined;
}) {
  if (!(isAddress(debouncedAddress) || debouncedAddress === ""))
    return "Insert a valid address";

  if (!account) return "Please connect your wallet first";

  if (recipient && account !== recipient)
    return "You are not the contract recipient";

  if (recipient && account === recipient && claimableAmountWei === BigInt(0))
    return "You have already claimed your funds";

  if (errorVesting) return errorVesting.message;

  if (errorToken) return errorToken.message;

  if (errorGasLimit) return "Error estimating gas limit";

  return undefined;
}
