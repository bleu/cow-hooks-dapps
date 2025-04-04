import { useMemo } from "react";
import { type Address, formatUnits } from "viem";
import { useReadTokenContract } from "./useReadTokenContract";
import { useTokens } from "./useTokens";

export function useTokensAfterSwap(
  tokens: Address[],
): Record<string, { balance: `${number}`; decimals: number; symbol: string }> {
  const balancesBeforeSwap = useTokens(tokens);

  const token0 = tokens.length > 0 ? tokens[0] : undefined;
  const token1 = tokens.length > 1 ? tokens[1] : undefined;

  const {
    userBalance: balance0,
    tokenSymbol: symbol0,
    tokenDecimals: decimals0,
  } = useReadTokenContract({ tokenAddress: token0 });
  const {
    userBalance: balance1,
    tokenSymbol: symbol1,
    tokenDecimals: decimals1,
  } = useReadTokenContract({ tokenAddress: token1 });

  const floatBalance0 = useMemo(
    () =>
      balance0 && decimals0 ? formatUnits(balance0, decimals0) : undefined,
    [balance0, decimals0],
  );
  const floatBalance1 = useMemo(
    () =>
      balance1 && decimals1 ? formatUnits(balance1, decimals1) : undefined,
    [balance1, decimals1],
  );

  return useMemo(() => {
    if (
      !token0 ||
      !token1 ||
      !floatBalance0 ||
      !floatBalance1 ||
      !symbol0 ||
      !symbol1 ||
      !decimals0 ||
      !decimals1
    )
      return balancesBeforeSwap;

    return {
      [token0]: {
        balance: floatBalance0,
        decimals: decimals0,
        symbol: symbol0,
      },
      [token1]: {
        balance: floatBalance1,
        decimals: decimals1,
        symbol: symbol1,
      },
    } as Record<
      string,
      { balance: `${number}`; decimals: number; symbol: string }
    >;
  }, [
    token0,
    token1,
    floatBalance0,
    floatBalance1,
    symbol0,
    symbol1,
    decimals0,
    decimals1,
    balancesBeforeSwap,
  ]);
}
