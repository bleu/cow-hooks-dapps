import { isChainIdSupportedByUniV2, readPairsData } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { BigNumber } from "ethers";
import useSWR from "swr";
import type { Address, PublicClient } from "viem";
import type { IPool, TokenData } from "../types";
import { getLpTokensList } from "../utils/getLpTokensList";
import { getTokensInfo } from "../utils/getTokensInfo";
import { useTokenList } from "./useTokenList";

async function getUserPools(
  ownerAddress: string,
  chainId: SupportedChainId,
  client: PublicClient,
  balancesDiff: Record<string, string>,
  poolTokens: TokenData[],
): Promise<IPool[]> {
  // Get lists of tokens
  const allLpTokens = await getLpTokensList(chainId, ownerAddress);

  const lpTokens = allLpTokens.filter((lpToken) => lpToken.chainId === chainId);

  // Read possibly missing tokens on chain and add price Usd
  const tokens = await getTokensInfo(
    lpTokens.flatMap((lpToken) => lpToken.tokens),
    poolTokens,
    chainId,
    client,
  );

  // Read contracts on-chain data
  const lpTokensInfo = await readPairsData(
    ownerAddress,
    lpTokens.map((lpToken) => lpToken.address),
    client,
    balancesDiff,
  );

  // Add on-chain info to pairs (amount of LPs)
  const lpTokensWithInfo = lpTokens.map((lpToken, idx) => {
    return { ...lpToken, ...lpTokensInfo[idx] };
  });

  const allPools: (IPool | undefined)[] = lpTokensWithInfo.map(
    (lpToken, _index) => {
      const tokenAddresses = [...lpToken.tokens];
      tokenAddresses.sort();

      const token0 = tokens.find(
        (token) => token.address === tokenAddresses[0],
      );
      const token1 = tokens.find(
        (token) => token.address === tokenAddresses[1],
      );

      if (!token0 || !token1) return;

      return {
        id: lpToken.address as Address,
        chain: String(chainId),
        decimals: 18,
        symbol: lpToken.symbol,
        address: lpToken.address as Address,
        type: "Uniswap v2",
        protocolVersion: 2 as const,
        totalSupply: lpToken.totalSupply,
        poolTokens: [
          {
            address: token0.address as Address,
            symbol: token0.symbol,
            decimals: token0.decimals,
            reserve: lpToken.reserve0.toString(),
            weight: 0.5,
          },
          {
            address: token1.address as Address,
            symbol: token1.symbol,
            decimals: token1.decimals,
            reserve: lpToken.reserve1.toString(),
            weight: 0.5,
          },
        ],
        userBalance: {
          walletBalance: lpToken.userBalance,
        },
      };
    },
  );

  return allPools
    .filter((pool) => pool !== undefined)
    .sort((a, b) => {
      const balanceA = BigNumber.from(a.userBalance.walletBalance);
      const balanceB = BigNumber.from(b.userBalance.walletBalance);

      if (balanceA.eq(balanceB)) return 0;
      return balanceA.gt(balanceB) ? -1 : 1;
    });
}

export function useUniV2Pools(
  ownerAddress: string | undefined,
  chainId: SupportedChainId | undefined,
  client: PublicClient | undefined,
  balancesDiff: Record<string, Record<string, string>>,
) {
  const { data: poolTokens } = useTokenList();
  return useSWR(
    [ownerAddress, chainId, poolTokens],
    async ([ownerAddress, chainId]): Promise<IPool[]> => {
      if (!ownerAddress || !chainId || !client || !poolTokens)
        throw new Error("Missing required data");

      if (!isChainIdSupportedByUniV2(chainId)) {
        throw new Error(`ChainId ${chainId} is not supported`);
      }

      //@ts-ignore
      const userBalancesDiff = balancesDiff[ownerAddress.toLowerCase()] ?? {};
      return await getUserPools(
        ownerAddress,
        chainId,
        client,
        userBalancesDiff,
        poolTokens,
      );
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      shouldRetryOnError: false,
    },
  );
}
