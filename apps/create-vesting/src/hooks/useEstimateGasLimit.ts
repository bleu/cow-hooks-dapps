import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import type { EstimateContractGasParameters, PublicClient } from "viem";

export const useEstimateGasLimit = ({
  publicClient,
  estimateGasParams,
  useSWRConfig,
}: {
  publicClient: PublicClient | undefined;
  estimateGasParams: EstimateContractGasParameters | undefined;
  useSWRConfig?: SWRConfiguration;
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
  } = useSWR(estimateGasParams ?? null, estimateGasLimit, useSWRConfig);
  const stringGasLimit = gasLimit ? String(gasLimit) : undefined;

  return { gasLimit: stringGasLimit, isLoadingGasLimit, errorGasLimit };
};