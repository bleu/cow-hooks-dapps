import { SupportedChainId } from "@cowprotocol/cow-sdk";
import useSWR from "swr";
import type { Address, PublicClient } from "viem";
import type { IPool } from "#/types";
import { getLpTokensList } from "#/utils/getLpTokensList";
import { getTokensInfo } from "#/utils/getTokensInfo";
import { getTokensList } from "#/utils/getTokensList";
import { readPairsData } from "#/utils/readPairsData";

async function getUserPools(
  ownerAddress: string,
  chainId: SupportedChainId,
  token: string,
  client: PublicClient,
): Promise<IPool[]> {
  // Get lists of tokens
  const [allLpTokens, allTokens] = await Promise.all([
    getLpTokensList(),
    getTokensList(chainId),
  ]);

  const lpTokens = allLpTokens.filter(
    (lpToken) => lpToken.chainId === chainId && lpToken.tokens.includes(token),
  );

  // Read possibly missing tokens on chain and add price Usd
  const tokens = await getTokensInfo(
    lpTokens.flatMap((lpToken) => lpToken.tokens),
    allTokens,
    chainId,
    client,
  );

  // Read contracts on-chain data
  const lpTokensInfo = await readPairsData(
    ownerAddress,
    lpTokens.map((lpToken) => lpToken.address),
    client,
  );

  // Add on-chain info to pairs (amount of LPs)
  const lpTokensWithInfo = lpTokens.map((lpToken, idx) => {
    return { ...lpToken, ...lpTokensInfo[idx] };
  });

  const userPools: IPool[] = lpTokensWithInfo
    .map((lpToken) => {
      const userBalance0 = lpToken.userBalance
        .mul(lpToken.reserve0)
        .div(lpToken.totalSupply)
        .mul(99)
        .div(100); // 1% slippage
      const userBalance1 = lpToken.userBalance
        .mul(lpToken.reserve1)
        .div(lpToken.totalSupply)
        .mul(99)
        .div(100); // 1% slippage;

      const token0 = tokens.find(
        (token) => token.address === lpToken.tokens[0],
      );
      const token1 = tokens.find(
        (token) => token.address === lpToken.tokens[1],
      );

      if (!token0 || !token1) return;

      const userBalanceUsd0 =
        (token0.priceUsd * userBalance0.toNumber()) / 10 ** token0.decimals;

      const userBalanceUsd1 =
        (token1.priceUsd * userBalance1.toNumber()) / 10 ** token1.decimals;

      return {
        id: lpToken.address as Address,
        chain: String(chainId),
        decimals: 18,
        symbol: lpToken.symbol,
        address: lpToken.address as Address,
        type: "Uniswap v2",
        protocolVersion: 2 as const,
        allTokens: [
          {
            address: token0.address as Address,
            symbol: token0.symbol,
            decimals: token0.decimals,
            userBalance: userBalance0,
            userBalanceUsd: userBalanceUsd0,
            weight: 0.5,
          },
          {
            address: token1.address as Address,
            symbol: token1.symbol,
            decimals: token1.decimals,
            userBalance: userBalance1,
            userBalanceUsd: userBalanceUsd1,
            weight: 0.5,
          },
        ],
        userBalance: {
          walletBalance: lpToken.userBalance,
          walletBalanceUsd: userBalanceUsd0 + userBalanceUsd1,
        },
      };
    })
    .filter((pool) => pool !== undefined);

  return userPools;
}

export function usePools(
  ownerAddress: string | undefined,
  chainId: SupportedChainId | undefined,
  token: string | undefined,
  client: PublicClient | undefined,
) {
  return useSWR(
    [ownerAddress, chainId, token, client],
    async ([ownerAddress, chainId, token, client]): Promise<IPool[]> => {
      if (!ownerAddress || !chainId || !token || !client) return [];
      if (
        chainId !== SupportedChainId.MAINNET &&
        chainId !== SupportedChainId.ARBITRUM_ONE
      )
        throw new Error("Unsupported chain");
      return await getUserPools(ownerAddress, chainId, token, client);
    },
    {
      revalidateOnFocus: false,
    },
  );
}
