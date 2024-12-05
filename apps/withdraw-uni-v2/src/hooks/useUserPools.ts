import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { usePools } from "./usePools";

export function useUserPools() {
  const { context, publicClient } = useIFrameContext();
  return usePools(
    context?.account,
    context?.chainId,
    publicClient,
    //@ts-ignore
    context?.balancesDiff as Record<string, Record<string, string>>,
  );
}
