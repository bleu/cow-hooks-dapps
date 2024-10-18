import { BalancerChainName, GQL_CLIENT } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import useSWR from "swr";
import { type Address, parseUnits } from "viem";
import type { IPool } from "../types";

interface IQuery {
  pools: {
    id: `0x${string}`;
    chain: string;
    address: Address;
    type: string;
    decimals: number;
    symbol: string;
    protocolVersion: 1 | 2 | 3;
    dynamicData: {
      aprItems: {
        apr: number;
        id: string;
      }[];
      totalLiquidity: string;
      volume24h: string;
      totalShares: string;
    };
    allTokens: {
      address: Address;
      symbol: string;
      decimals: number;
      isNested: boolean;
      weight: number;
    }[];
    userBalance: {
      totalBalance: string;
      walletBalance: string;
      totalBalanceUsd: number;
      stakedBalances: {
        balance: string;
        stakingId: string;
      }[];
    };
  }[];
}

const USER_POOLS_QUERY = gql`
  query GetPools(
    $first: Int
    $skip: Int
    $orderBy: GqlPoolOrderBy
    $orderDirection: GqlPoolOrderDirection
    $where: GqlPoolFilter
    $textSearch: String
  ) {
    pools: poolGetPools(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
      textSearch: $textSearch
    ) {
      id
      chain
      decimals
      symbol
      address
      type
      protocolVersion
      dynamicData {
        aprItems {
          apr
          id
        }
        totalLiquidity
        volume24h
        totalShares
      }
      allTokens {
        address
        symbol
        decimals
        isNested
        weight
      }
      userBalance {
        totalBalance
        walletBalance
        totalBalanceUsd
        stakedBalances {
          balance
          stakingId
        }
      }
    }
  }
`;

interface IGetPoolsWhere {
  userAddress?: Address;
  tokensIn?: Address[];
  poolTypeIn: string[];
}

export function usePools(
  where: IGetPoolsWhere,
  chainId?: SupportedChainId,
  orderBy?: string,
) {
  return useSWR(
    [where, chainId],
    async ([where, chainId]): Promise<IPool[]> => {
      if (!chainId) return [];
      const chainName = BalancerChainName[chainId];
      return await GQL_CLIENT[chainId]
        .request<IQuery>(USER_POOLS_QUERY, {
          where: {
            ...where,
            chainIn: [chainName],
          },
          orderBy,
        })
        .then((result) => {
          return result.pools.map((pool) => ({
            ...pool,
            userBalance: {
              ...pool.userBalance,
              walletBalance: parseUnits(
                pool.userBalance.walletBalance,
                pool.decimals,
              ),
              totalBalance: parseUnits(
                pool.userBalance.totalBalance,
                pool.decimals,
              ),
              stakedBalances: pool.userBalance.stakedBalances.map((staked) => ({
                balance: parseUnits(staked.balance, pool.decimals),
                stakingId: staked.stakingId,
              })),
            },
            dynamicData: {
              ...pool.dynamicData,
              totalShares: parseUnits(
                pool.dynamicData.totalShares,
                pool.decimals,
              ),
            },
          }));
        });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}