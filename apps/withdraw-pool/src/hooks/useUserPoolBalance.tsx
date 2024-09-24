import { Token } from "@uniswap/sdk-core";

import { gql } from "graphql-request";
import useSWR from "swr";

import { IPoolBalance } from "../types";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { BalancerChainName, GQL_CLIENT } from "../api/balancer";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";

interface PoolData {
  id: `0x${string}`;
  address: `0x${string}`;
  decimals: number;
  symbol: string;
  type: string;
  chain: string;
  protocolVersion: 1 | 2 | 3;
  dynamicData: {
    totalShares: `${number}`;
  };
  userBalance: {
    totalBalance: `${number}`;
    totalBalanceUsd: number;
  };
  poolTokens: {
    id: `0x${string}`;
    address: `0x${string}`;
    name: string;
    decimals: number;
    symbol: string;
    balance: BigNumber;
    balanceUSD: number;
  }[];
}

export const POOL_QUERY = gql`
  query GetPool($id: String!, $chain: GqlChain!, $userAddress: String) {
    pool: poolGetPool(id: $id, chain: $chain, userAddress: $userAddress) {
      id
      address
      decimals
      symbol
      type
      chain
      protocolVersion
      dynamicData {
        totalShares
      }
      userBalance {
        totalBalance
        totalBalanceUsd
      }
      poolTokens {
        id
        address
        name
        decimals
        symbol
        balance
        balanceUSD
      }
    }
  }
`;

async function fetchUserPoolBalance(
  chainId?: SupportedChainId,
  poolId?: string,
  user?: string
): Promise<IPoolBalance[]> {
  if (!user || !chainId || !poolId) return [];
  const chainName = BalancerChainName[chainId];
  const result = await GQL_CLIENT.request<{
    pool: PoolData;
  }>(POOL_QUERY, {
    id: poolId,
    chain: chainName,
    userAddress: user,
  });
  if (!result.pool) {
    throw new Error("Pool not found");
  }
  const userBpt = parseUnits(
    result.pool.userBalance.totalBalance.toString(),
    result.pool.decimals
  );
  const totalBpt = parseUnits(
    result.pool.dynamicData.totalShares.toString(),
    result.pool.decimals
  );
  return result.pool.poolTokens.map((token) => {
    const balanceUSDTotal = parseUnits(token.balanceUSD.toString(), 18);
    const balanceTotal = parseUnits(token.balance.toString(), token.decimals);
    return {
      token: new Token(
        chainId,
        token.address,
        token.decimals,
        token.symbol,
        token.name
      ),
      balance: balanceTotal.mul(userBpt).div(totalBpt),
      fiatAmount: Number(
        formatUnits(balanceUSDTotal.mul(userBpt).div(totalBpt), 18)
      ),
    };
  });
}

export function useUserPoolBalance({
  chainId,
  poolId,
  user,
}: {
  chainId?: SupportedChainId;
  poolId?: string;
  user?: string;
}) {
  return useSWR([chainId, poolId, user], () =>
    fetchUserPoolBalance(chainId, poolId, user)
  );
}
