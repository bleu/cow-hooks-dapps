import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { usePools } from "./usePools";

export function useUserPools() {
  const { context, publicClient } = useIFrameContext();
  const useSwrData = usePools(
    context?.account,
    context?.chainId,
    context?.orderParams?.sellTokenAddress,
    publicClient,
  );

  const data = useSwrData.data;

  return { ...useSwrData, data };
}
