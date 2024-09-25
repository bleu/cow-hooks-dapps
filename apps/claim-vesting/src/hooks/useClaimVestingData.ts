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

  /// ---------------- VESTING DATA ----------------

  const readVesting = useCallback(
    async (address: Address) => {
      const claimableAmountWei =
        publicClient &&
        (await publicClient.readContract({
          address: address,
          abi: VestingEscrowAbi,
          functionName: "unclaimed",
        }));

      const recipient =
        publicClient &&
        (await publicClient.readContract({
          address: address,
          abi: VestingEscrowAbi,
          functionName: "recipient",
        }));
      const tokenAddress =
        publicClient &&
        (await publicClient.readContract({
          address: address,
          abi: VestingEscrowAbi,
          functionName: "token",
        }));

      return {
        claimableAmountWei,
        recipient,
        tokenAddress,
      };
    },
    [publicClient]
  );

  const shouldFetchVesting = isAddress(debouncedAddress);

  console.log("debouncedAddress", debouncedAddress);

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

  const claimableAmountWei = vestingData?.claimableAmountWei;
  const recipient = vestingData?.recipient;
  const tokenAddress = vestingData?.tokenAddress;

  useEffect(() => {
    console.log("vestingData", vestingData);
  }, [vestingData]);

  useEffect(() => {
    console.log("vesting Error", errorVesting);
  }, [errorVesting]);

  /// ---------------- TOKEN DATA ----------------

  const readToken = useCallback(
    async (address: Address) => {
      const symbol =
        publicClient &&
        (await publicClient.readContract({
          address: address,
          abi: erc20Abi,
          functionName: "symbol",
        }));

      const decimals =
        publicClient &&
        (await publicClient.readContract({
          address: address,
          abi: erc20Abi,
          functionName: "decimals",
        }));

      return {
        symbol: symbol,
        decimals: decimals,
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

  const tokenSymbol = tokenData?.symbol ? String(tokenData?.symbol) : "";
  const decimals = tokenData?.decimals; //TODO: treat decimals

  /// --------------------------------------------
  useEffect(() => {
    console.log("tokenData", tokenData);
  }, [tokenData]);

  useEffect(() => {
    console.log("tokenData Error", errorToken);
  }, [errorToken]);

  const errorMessage = getErrorMessage({ account, recipient });
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
}: {
  account: string | undefined;
  recipient: string | undefined;
}) {
  console.log(account);
  console.log(recipient);

  if (!account) return "Please connect your wallet first";

  if (account !== recipient) return "You are not the contract recipient";

  return undefined;
}
