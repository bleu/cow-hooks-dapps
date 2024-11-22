import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import useSWR from "swr";
import type { PublicClient } from "viem";
import type { IPool } from "#/types";
import { getUserLpMints } from "#/utils/getUserLpMints";
import { processMints } from "#/utils/processMints";
import { readUserBalances } from "#/utils/readUserBalances";

// Just do this return a IPool[]
async function getUserPools(
  ownerAddress: string,
  chainId: SupportedChainId,
  token: string,
  client: PublicClient,
): Promise<IPool[]> {
  // Query every LP token mint the user has done
  const mints = await getUserLpMints(ownerAddress, chainId);

  // Process mints
  const pairs = processMints(mints, token);

  // Read contract data (amount of LPs)
  const userPoolBalances = await readUserBalances(
    ownerAddress,
    pairs.map((pair) => pair.id),
    client,
  );

  // Add balances to pairs (amount of LPs)
  const pairsWithBalances = pairs.map((pair, idx) => {
    return { ...pair, userBalance: userPoolBalances[idx] };
  });

  // format data as IPool[]
  const userPools: IPool[] = pairsWithBalances.map((pair) => {
    const userBalance0 = pair.userBalance
      .mul(String(pair.reserve0 * 10 ** pair.token0.decimals))
      .div(String(pair.totalSupply * 10 ** 18))
      .mul(99)
      .div(100); // 1% slippage
    const userBalance1 = pair.userBalance
      .mul(String(pair.reserve1 * 10 ** pair.token1.decimals))
      .div(String(pair.totalSupply * 10 ** 18))
      .mul(99)
      .div(100); // 1% slippage;
    const userBalanceUsd0 =
      (userBalance0.toNumber() * pair.token0.priceUsd) /
      10 ** pair.token0.decimals;
    const userBalanceUsd1 =
      (userBalance1.toNumber() * pair.token1.priceUsd) /
      10 ** pair.token1.decimals;

    return {
      id: pair.id,
      chain: String(chainId),
      decimals: 18,
      symbol: `${pair.token0.symbol} - ${pair.token1.symbol}`,
      address: pair.id,
      type: "Uniswap v2",
      protocolVersion: 2,
      allTokens: [
        {
          address: pair.token0.id,
          symbol: pair.token0.symbol,
          decimals: pair.token0.decimals,
          userBalance: userBalance0,
          userBalanceUsd: userBalanceUsd0,
          weight: 0.5,
        },
        {
          address: pair.token1.id,
          symbol: pair.token1.symbol,
          decimals: pair.token1.decimals,
          userBalance: userBalance1,
          userBalanceUsd: userBalanceUsd1,
          weight: 0.5,
        },
      ],
      userBalance: {
        walletBalance: pair.userBalance,
        walletBalanceUsd: userBalanceUsd0 + userBalanceUsd1,
      },
    };
  });

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
      return await getUserPools(ownerAddress, chainId, token, client);
    },
    {
      revalidateOnFocus: false,
    },
  );
}
