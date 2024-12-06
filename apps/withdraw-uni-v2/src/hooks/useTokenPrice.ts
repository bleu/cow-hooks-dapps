import { type IToken, useIFrameContext } from "@bleu/cow-hooks-ui";
import { getCowProtocolUsdPrice } from "@bleu/utils";
import { useCallback } from "react";
import useSWR from "swr";

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
