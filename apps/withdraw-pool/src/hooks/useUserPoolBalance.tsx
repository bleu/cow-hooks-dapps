import { Token } from "@uniswap/sdk-core";

import { gql } from "graphql-request";
import useSWR from "swr";

import type { IBalance } from "@bleu/cow-hooks-ui";
import { BalancerChainName, GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import type { Address } from "viem";

interface IQuery {
  id: `0x${string}`;
  address: Address;
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
    address: Address;
    name: string;
    decimals: number;
    symbol: string;
    balance: string;
    balanceUSD: number;
    weight: number;
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
        weight
      }
    }
  }
`;

async function fetchUserPoolBalance(
  chainId?: SupportedChainId,
  poolId?: string,
  user?: string,
): Promise<IBalance[]> {
  if (!user || !chainId || !poolId) return [];
  const chainName = BalancerChainName[chainId];
  const result = await GQL_CLIENT[chainId].request<{
    pool: IQuery;
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
    result.pool.decimals,
  );
  const totalBpt = parseUnits(
    result.pool.dynamicData.totalShares.toString(),
    result.pool.decimals,
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
        token.name,
      ),
      balance: balanceTotal.mul(userBpt).div(totalBpt),
      fiatAmount: Number(
        formatUnits(balanceUSDTotal.mul(userBpt).div(totalBpt), 18),
      ),
      weight: token.weight,
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
  return useSWR(
    [chainId, poolId, user],
    () => fetchUserPoolBalance(chainId, poolId, user),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}
