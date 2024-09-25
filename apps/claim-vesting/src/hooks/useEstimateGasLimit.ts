import useSWR from "swr";
import type { EstimateContractGasParameters, PublicClient } from "viem";

export const useEstimateGasLimit = ({
  publicClient,
  estimateGasParams,
}: {
  publicClient: PublicClient | undefined;
  estimateGasParams: EstimateContractGasParameters | undefined;
}) => {
  const estimateGasLimit = async (
    estimateGasParams: EstimateContractGasParameters,
  ) => {
    const result = publicClient
      ? await publicClient.estimateContractGas(estimateGasParams)
      : undefined;

    return result;
  };

  const {
    data: gasLimit,
    isLoading: isLoadingGasLimit,
    error: errorGasLimit,
  } = useSWR(estimateGasParams ?? null, estimateGasLimit, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  });
  const stringGasLimit = gasLimit ? String(gasLimit) : undefined;

  return { gasLimit: stringGasLimit, isLoadingGasLimit, errorGasLimit };
};
