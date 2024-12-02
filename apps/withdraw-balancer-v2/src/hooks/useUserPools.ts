import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { usePools } from "./usePools";

export function useUserPools() {
  const { context, publicClient } = useIFrameContext();
  const useSwrData = usePools(
    context?.account,
    context?.chainId,
    context?.orderParams?.sellTokenAddress,
    publicClient,
    //@ts-ignore
    context?.balancesDiff as Record<string, Record<string, string>>,
  );

  const data = useSwrData.data;

  return { ...useSwrData, data };
}
