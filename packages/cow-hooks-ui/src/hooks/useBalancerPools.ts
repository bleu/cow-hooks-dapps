import { BALANCER_GQL_CLIENT, BalancerChainName } from "@bleu/utils";
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
        type: string;
      }[];
      totalLiquidity: string;
      volume24h: string;
      totalShares: string;
    };
    poolTokens: {
      address: Address;
      symbol: string;
      decimals: number;
      weight: number;
    }[];
    userBalance: {
      walletBalance: string;
      walletBalanceUsd: number;
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
          type
        }
        totalLiquidity
        volume24h
        totalShares
      }
      poolTokens {
        address
        symbol
        decimals
        weight
      }
      userBalance {
        walletBalance
        walletBalanceUsd
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
  protocolVersionIn?: (1 | 2 | 3)[];
}

export function useBalancerPools(
  where: IGetPoolsWhere,
  chainId?: SupportedChainId,
  orderBy?: string,
) {
  return useSWR(
    [where, chainId],
    async ([where, chainId]): Promise<IPool[]> => {
      if (!chainId) return [];
      const chainName = BalancerChainName[chainId];
      return await BALANCER_GQL_CLIENT[chainId]
        .request<IQuery>(USER_POOLS_QUERY, {
          where: {
            ...where,
            chainIn: [chainName],
          },
          orderBy,
        })
        .then((result) => {
          return result.pools
            .map((pool) => ({
              ...pool,
              userBalance: {
                ...pool.userBalance,
                walletBalance: parseUnits(
                  pool.userBalance.walletBalance,
                  pool.decimals,
                ),
                stakedBalances: pool.userBalance.stakedBalances.map(
                  (staked) => ({
                    balance: parseUnits(
                      Number(staked.balance).toFixed(pool.decimals),
                      pool.decimals,
                    ),
                    stakingId: staked.stakingId,
                  }),
                ),
              },
              dynamicData: {
                ...pool.dynamicData,
                totalShares: parseUnits(
                  Number(pool.dynamicData.totalShares).toFixed(pool.decimals),
                  pool.decimals,
                ),
              },
            }))
            .filter((pool) => pool.poolTokens.length === 2);
        });
    },
    {
      revalidateOnFocus: false,
    },
  );
}
