import { useIFrameContext } from "@bleu/cow-hooks-ui";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import type { EstimateContractGasParameters } from "viem";

export const useEstimateGasLimit = ({
  estimateGasParams,
  useSWRConfig,
}: {
  estimateGasParams: EstimateContractGasParameters | undefined;
  useSWRConfig?: SWRConfiguration;
}) => {
  const { publicClient } = useIFrameContext();
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
