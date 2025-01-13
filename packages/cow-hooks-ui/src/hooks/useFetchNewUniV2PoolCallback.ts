import { readPairData } from "@bleu/utils";
import type { Address, PublicClient } from "viem";
import { useIFrameContext } from "../context";
import type { IPool } from "../types";
import { getTokensInfo } from "../utils/getTokensInfo";
import { readTokensData } from "../utils/readTokensData";
import { storeExtraTokens } from "../utils/storage";

async function fetchNewPool({
  chainId,
  account,
  poolAddress,
  client,
  balancesDiff,
  saveOnStore,
}: {
  chainId: number;
  account: string;
  poolAddress: Address;
  client: PublicClient;
  balancesDiff: Record<string, string>;
  saveOnStore: boolean;
}): Promise<IPool> {
  // Get lists of tokens
  const lpToken = await readPairData(
    account,
    poolAddress,
    client,
    balancesDiff
  );
  // Read possibly missing tokens on chain and add price Usd
  const tokens = await getTokensInfo(lpToken.tokens, [], chainId, client);

  let token0 = tokens.find((token) => token.address === lpToken.tokens[0]);
  let token1 = tokens.find((token) => token.address === lpToken.tokens[1]);

  if (!token0 || !token1) {
    [token0, token1] = await readTokensData(lpToken.tokens, client, chainId);
  }

  if (saveOnStore) {
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
        account
      );
    } catch (e) {
      console.error("Error caching new LP token:", e);
    }
  }

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
        weight: 0.5,
        reserve: lpToken.reserve0.toString(),
      },
      {
        address: token1.address as Address,
        symbol: token1.symbol,
        decimals: token1.decimals,
        weight: 0.5,
        reserve: lpToken.reserve1.toString(),
      },
    ],
    userBalance: {
      walletBalance: lpToken.userBalance,
    },
  };
}

export function useFetchNewUniV2PoolCallback(saveOnStore = true) {
  const { context, publicClient } = useIFrameContext();
  //@ts-ignore
  const { account, chainId, balancesDiff } = context ?? {
    account: undefined,
    chainId: undefined,
    balancesDiff: undefined,
  };

  if (!account || !chainId || !publicClient || balancesDiff === undefined)
    return;

  const userBalancesDiff = balancesDiff[account.toLowerCase()] ?? {};

  return async (poolAddress: Address) => {
    return await fetchNewPool({
      chainId,
      account,
      poolAddress,
      client: publicClient,
      balancesDiff: userBalancesDiff as Record<string, string>,
      saveOnStore,
    });
  };
}
