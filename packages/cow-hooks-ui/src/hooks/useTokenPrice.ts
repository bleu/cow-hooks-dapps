import { getCowProtocolUsdPrice } from "@bleu/utils";
import { useCallback } from "react";
import useSWR from "swr";
import { useIFrameContext } from "../context";
import type { IToken } from "../types";

export function useTokenPrice(token?: IToken) {
  const { context } = useIFrameContext();
  const getTokenPriceCallback = useCallback(async () => {
    if (!context?.chainId || !token) return 0;
    return getCowProtocolUsdPrice({
      chainId: context.chainId,
      tokenAddress: token.address,
      tokenDecimals: token.decimals,
    });
  }, [context, token]);
  return useSWR<number>(token, getTokenPriceCallback, {
    shouldRetryOnError: false,
  });
}
