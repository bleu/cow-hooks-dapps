import { useCallback } from "react";
import useSWR from "swr";
import { type Address, type PublicClient, isAddress } from "viem";
import { VestingEscrowAbi } from "#/abis/VestingEscrowAbi";

export const useReadVesting = ({
  publicClient,
  debouncedAddress,
}: {
  publicClient: PublicClient | undefined;
  debouncedAddress: string;
}) => {
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

      for (const result of vestingResults ?? []) {
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
      }

      return {
        claimableAmountWei: vestingResults?.[0],
        recipient: vestingResults?.[1],
        tokenAddress: vestingResults?.[2],
      };
    },
    [publicClient],
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

  return {
    claimableAmountWei,
    recipient,
    tokenAddress,
    isLoadingVesting,
    errorVesting,
  };
};
