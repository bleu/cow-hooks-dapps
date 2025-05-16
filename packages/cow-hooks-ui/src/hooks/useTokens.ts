import { useCallback, useEffect, useState } from "react";
import { type Address, formatUnits } from "viem";
import { useIFrameContext } from "../context";
import { readTokenContract } from "./useReadTokenContract";

export function useTokens(tokens: Address[]) {
  const { context, publicClient } = useIFrameContext();
  const [tokensBalance, setTokensBalance] = useState<
    Record<string, { balance: `${number}`; decimals: number; symbol: string }>
  >({});

  const updateTokensInfo = useCallback(async () => {
    if (!context?.account || !publicClient) return;
    const tokenReadInfo = await Promise.all(
      tokens.map((token) => {
        return readTokenContract(
          token,
          publicClient,
          context.account as Address,
          context.orderParams,
          context.isPreHook,
        );
      }),
    );

    const newTokensBalance = tokenReadInfo.reduce(
      (acc, tokenInfo, index) => {
        // biome-ignore lint:
        if (!tokenInfo.decimals.result) return { ...acc };
        return {
          // biome-ignore lint:
          ...acc,
          [tokens[index]]: {
            balance: formatUnits(
              tokenInfo?.balance?.result || BigInt(0),
              tokenInfo.decimals.result,
            ) as `${number}`,
            decimals: tokenInfo.decimals.result,
            symbol: tokenInfo.symbol.result || "",
          },
        };
      },
      {} as Record<
        string,
        { balance: `${number}`; decimals: number; symbol: string }
      >,
    );

    setTokensBalance(newTokensBalance);
  }, [
    context?.account,
    publicClient,
    tokens,
    context?.orderParams,
    context?.isPreHook,
  ]);

  useEffect(() => {
    updateTokensInfo();
  }, [updateTokensInfo]);

  return tokensBalance;
}
