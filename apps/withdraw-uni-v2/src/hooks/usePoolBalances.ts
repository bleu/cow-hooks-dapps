import {
  type IPool,
  useIFrameContext,
  useTokenPrice,
} from "@bleu/cow-hooks-ui";
import { Token } from "@uniswap/sdk-core";
import { BigNumber } from "ethers";
import { useMemo } from "react";
import { formatUnits } from "viem";

export function usePoolBalances(pool?: IPool) {
  const { context } = useIFrameContext();
  const {
    data: token0Price,
    isLoading: isLoadingToken0,
    isValidating: isValidatingToken0,
  } = useTokenPrice(pool?.allTokens[0]);
  const {
    data: token1Price,
    isLoading: isLoadingToken1,
    isValidating: isValidatingToken1,
  } = useTokenPrice(pool?.allTokens[1]);

  const data = useMemo(() => {
    if (!pool || !pool.totalSupply || !context?.chainId) return;
    const totalSupply = BigNumber.from(pool.totalSupply);
    return pool?.allTokens.map((token, index) => {
      const balance = BigNumber.from(token.reserve)
        .mul(pool.userBalance.walletBalance)
        .div(totalSupply);

      const balanceNumber = Number(
        formatUnits(balance.toBigInt(), token.decimals),
      );

      const fiatAmount =
        balanceNumber * ((index === 0 ? token0Price : token1Price) || 0);
      return {
        token: new Token(
          context.chainId,
          token.address,
          token.decimals,
          token.symbol,
        ),
        balance,
        fiatAmount,
        weight: token.weight,
      };
    });
  }, [pool, token0Price, token1Price, context?.chainId]);

  return {
    data,
    isLoading: isLoadingToken0 || isLoadingToken1,
    isValidating: isValidatingToken0 || isValidatingToken1,
  };
}
