"use client";

import { useIFrameContext, useReadTokenContract } from "@bleu/cow-hooks-ui";
import { Token } from "@uniswap/sdk-core";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from "react";
import type { Address } from "viem";

interface TokenWithBalance extends Token {
  userBalance: bigint;
}

type TokenContextType = {
  token: TokenWithBalance | undefined;
};

export const TokenContext = createContext({} as TokenContextType);

export function TokenContextProvider({ children }: PropsWithChildren) {
  const { context } = useIFrameContext();

  const tokenAddress = context?.orderParams?.buyTokenAddress as
    | Address
    | undefined;

  const { tokenSymbol, tokenDecimals, userBalance } = useReadTokenContract({
    tokenAddress,
  });

  const token = useMemo(() => {
    const token =
      context?.chainId && tokenAddress && tokenDecimals
        ? (new Token(
            context.chainId,
            tokenAddress,
            tokenDecimals,
            tokenSymbol,
          ) as TokenWithBalance)
        : undefined;
    if (!token || !userBalance) return;
    token.userBalance = userBalance;
    return token;
  }, [context?.chainId, tokenAddress, tokenDecimals, tokenSymbol, userBalance]);

  return (
    <TokenContext.Provider
      value={{
        token,
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
