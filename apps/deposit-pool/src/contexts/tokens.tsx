"use client";

import { useSelectedPool } from "#/hooks/useSelectedPool";
import { useIFrameContext, useReadTokenContract } from "@bleu/cow-hooks-ui";
import { Token } from "@uniswap/sdk-core";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from "react";
import type { Address } from "viem";
import { formatTokenBalance } from "#/utils/formatTokenBalance";

interface TokenWithBalance extends Token {
  balanceNow: number;
  balanceAfterSwap: number;
  balanceNowFormatted: string;
  balanceAfterSwapFormatted: string;
}

type TokenContextType = {
  tokens: Record<string, TokenWithBalance> | undefined;
};

export const TokenContext = createContext({} as TokenContextType);

export function TokenContextProvider({ children }: PropsWithChildren) {
  const { context } = useIFrameContext();

  const selectedPool = useSelectedPool();

  // console.log(selectedPool?.allTokens);

  const tokenAddress1 = selectedPool?.allTokens[0].address.toLowerCase() as
    | Address
    | undefined;
  const tokenAddress2 = selectedPool?.allTokens[1].address.toLowerCase() as
    | Address
    | undefined;

  const {
    tokenSymbol: tokenSymbol1,
    tokenDecimals: tokenDecimals1,
    userBalance: userBalance1,
  } = useReadTokenContract({
    tokenAddress: tokenAddress1,
  });

  const {
    tokenSymbol: tokenSymbol2,
    tokenDecimals: tokenDecimals2,
    userBalance: userBalance2,
  } = useReadTokenContract({
    tokenAddress: tokenAddress2,
  });

  const tokens = useMemo(() => {
    if (!context || context.orderParams === null || !context?.account) return;
    const tokens =
      context?.chainId &&
      tokenAddress1 &&
      tokenAddress2 &&
      tokenSymbol1 &&
      tokenSymbol2 &&
      tokenDecimals1 &&
      tokenDecimals2
        ? ({
            [tokenAddress1]: new Token(
              context.chainId,
              tokenAddress1,
              tokenDecimals1,
              tokenSymbol1,
            ),
            [tokenAddress2]: new Token(
              context.chainId,
              tokenAddress2,
              tokenDecimals2,
              tokenSymbol2,
            ),
          } as Record<string, TokenWithBalance>)
        : undefined;
    if (
      !tokens ||
      userBalance1 === undefined ||
      userBalance2 === undefined ||
      !tokenAddress1 ||
      !tokenAddress2
    )
      return;
    if (!tokenDecimals1 || !tokenDecimals2) return tokens;
    const token1Balances = formatTokenBalance(
      userBalance1,
      tokenDecimals1,
      context.orderParams.buyTokenAddress.toLowerCase() ===
        context.account.toLowerCase()
        ? context.orderParams.buyAmount
        : null,
    );
    const token2Balances = formatTokenBalance(
      userBalance2,
      tokenDecimals2,
      context.orderParams.buyTokenAddress.toLowerCase() ===
        context.account.toLowerCase()
        ? context.orderParams.buyAmount
        : null,
    );
    tokens[tokenAddress1].balanceNow = token1Balances.balanceNow;
    tokens[tokenAddress1].balanceNowFormatted =
      token1Balances.balanceNowFormatted;
    tokens[tokenAddress1].balanceAfterSwap = token1Balances.balanceAfterSwap;
    tokens[tokenAddress1].balanceAfterSwapFormatted =
      token1Balances.balanceAfterSwapFormatted;
    tokens[tokenAddress2].balanceNow = token2Balances.balanceNow;
    tokens[tokenAddress2].balanceNowFormatted =
      token2Balances.balanceNowFormatted;
    tokens[tokenAddress2].balanceAfterSwap = token2Balances.balanceAfterSwap;
    tokens[tokenAddress2].balanceAfterSwapFormatted =
      token2Balances.balanceAfterSwapFormatted;
    return tokens;
  }, [
    context,
    tokenAddress1,
    tokenDecimals1,
    tokenSymbol1,
    userBalance1,
    tokenAddress2,
    tokenDecimals2,
    tokenSymbol2,
    userBalance2,
  ]);

  return (
    <TokenContext.Provider
      value={{
        tokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  return context;
}
