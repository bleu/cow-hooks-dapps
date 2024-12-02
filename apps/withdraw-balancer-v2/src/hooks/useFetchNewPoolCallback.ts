import type { IPool } from "@bleu/cow-hooks-ui";
import type { Address, PublicClient } from "viem";
import { getTokensInfo } from "#/utils/getTokensInfo";
import { readPairData } from "#/utils/readPairsData";
import { useIFrameContext } from "@bleu/cow-hooks-ui";
import { storeExtraTokens } from "#/utils/storage";

async function fetchNewPool({
  chainId,
  account,
  poolAddress,
  client,
}: {
  chainId: number;
  account: string;
  poolAddress: Address;
  client: PublicClient;
}): Promise<IPool> {
  // Get lists of tokens
  const lpToken = await readPairData(account, poolAddress, client);

  // Read possibly missing tokens on chain and add price Usd
  const tokens = await getTokensInfo(lpToken.tokens, [], chainId, client);

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

  const token0 = tokens.find((token) => token.address === lpToken.tokens[0]);
  const token1 = tokens.find((token) => token.address === lpToken.tokens[1]);

  if (!token0 || !token1)
    throw new Error(
      "Unexpected error in fetchNewPool: some of tokens are undefined",
    );

  try {
    storeExtraTokens(
      [
        {
          chainId,
          address: poolAddress,
          name: `Uniswap V2 ${token0.symbol}/${token1.symbol}`,
          symbol: lpToken.symbol,
          decimals: 18, // UniV2 are always 18 decimals
          extensions: { tokens: lpToken.tokens.join(",") },
        },
      ],
      chainId,
      account,
    );
  } catch (e) {
    console.error("Error caching new LP token:", e);
  }

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
}

export function useFetchNewPoolCallback() {
  const { context, publicClient } = useIFrameContext();
  const { account, chainId } = context ?? {
    account: undefined,
    chainId: undefined,
  };

  if (!account || !chainId || !publicClient) return;

  return async (poolAddress: Address) => {
    return await fetchNewPool({
      chainId,
      account,
      poolAddress,
      client: publicClient,
    });
  };
}
