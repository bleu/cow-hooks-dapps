import { useIFrameContext } from "../context";
import { useUniV2Pools } from "./useUniV2Pools";

export function useUserUniV2Pools() {
  const { context, publicClient } = useIFrameContext();
  return useUniV2Pools(
    context?.account,
    context?.chainId,
    publicClient,
    //@ts-ignore
    context?.balancesDiff as Record<string, Record<string, string>>,
  );
}
