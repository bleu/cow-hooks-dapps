import { useMemo } from "react";
import type { Address } from "viem";
import { updateTokenBalanceAfterSwap } from "../utils/math";
import { useSwapAmount } from "./useSwapAmount";
import { useTokens } from "./useTokens";
import { useIFrameContext } from "../context";

export function useTokensAfterSwap(
  tokens: Address[]
): Record<string, { balance: `${number}`; decimals: number; symbol: string }> {
  const { context } = useIFrameContext();
  const balancesBeforeSwap = useTokens(tokens);
  const { buyAmount, sellAmount } = useSwapAmount();
  return useMemo(() => {
    if (!buyAmount || !sellAmount || !context?.orderParams)
      return balancesBeforeSwap;

    return Object.keys(balancesBeforeSwap || {}).reduce(
      (acc, token, _index) => {
        const tokenBalance = balancesBeforeSwap[token];
        if (!tokenBalance) return acc;
        return {
          // biome-ignore lint:
          ...acc,
          [token]: {
            balance: updateTokenBalanceAfterSwap({
              userBalance: balancesBeforeSwap[token].balance,
              tokenAddress: token as Address,
              tokenDecimals: balancesBeforeSwap[token].decimals,
              tokenBuyAddress: context.orderParams?.buyTokenAddress as Address,
              tokenSellAddress: context.orderParams
                ?.sellTokenAddress as Address,
              sellAmount,
              buyAmount,
            }),
            decimals: balancesBeforeSwap[token].decimals,
            symbol: balancesBeforeSwap[token].symbol,
          },
        };
      },
      {} as Record<
        string,
        { balance: `${number}`; decimals: number; symbol: string }
      >
    );
  }, [balancesBeforeSwap, buyAmount, sellAmount, context?.orderParams]);
}
