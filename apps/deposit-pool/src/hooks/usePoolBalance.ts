import { Token } from "@uniswap/sdk-core";

import { gql } from "graphql-request";
import useSWR from "swr";

import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { parseUnits } from "ethers/lib/utils";
import { BalancerChainName, GQL_CLIENT } from "@bleu/utils";
import type { IBalance } from "@bleu/cow-hooks-ui";
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

async function fetchPoolBalance(
  chainId?: SupportedChainId,
  poolId?: string,
): Promise<IBalance[]> {
  if (!chainId || !poolId) return [];
  const chainName = BalancerChainName[chainId];
  const result = await GQL_CLIENT[chainId].request<{
    pool: IQuery;
  }>(POOL_QUERY, {
    id: poolId,
    chain: chainName,
  });
  if (!result.pool) {
    throw new Error("Pool not found");
  }

  const balances = result.pool.poolTokens.map((token) => {
    const balanceTotal = parseUnits(token.balance.toString(), token.decimals);

    return {
      token: new Token(chainId, token.address, token.decimals, token.symbol),
      balance: balanceTotal,
      fiatAmount: token.balanceUSD,
      weight: token.weight,
    };
  });
  return balances;
}

export function usePoolBalance({
  chainId,
  poolId,
}: {
  chainId?: SupportedChainId;
  poolId?: string;
}) {
  return useSWR([chainId, poolId], () => fetchPoolBalance(chainId, poolId));
}
