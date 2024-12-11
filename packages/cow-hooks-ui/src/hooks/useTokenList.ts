import { useCallback } from "react";
import useSWR from "swr";
import { useIFrameContext } from "../context/iframe";
import type { TokenData } from "../types";
import { getTokensList } from "../utils/getTokensList";

export function useTokenList() {
  const { context } = useIFrameContext();

  const tokenListFetcher = useCallback(async () => {
    if (!context?.chainId) return;
    return getTokensList(context?.chainId);
  }, [context?.chainId]);

  return useSWR<TokenData[] | undefined>(
    `tokenList-${context?.chainId}`,
    tokenListFetcher,
  );
}
