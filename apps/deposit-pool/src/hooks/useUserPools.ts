// TODO: Replace this with right api call

import { SupportedChainId } from "@cowprotocol/cow-sdk";

import { gql } from "graphql-request";
import useSWR from "swr";

import { Address, parseUnits } from "viem";
import { IMinimalPool } from "@bleu/cow-hooks-ui";
import { BalancerChainName, GQL_CLIENT } from "@bleu/utils";

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
      totalLiquidity: string;
      volume24h: string;
      totalShares: string;
    };
    allTokens: {
      address: Address;
      symbol: string;
      decimals: number;
      isNested: boolean;
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
        totalLiquidity
        volume24h
        totalShares
      }
      allTokens {
        address
        symbol
        decimals
        isNested
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

export function useUserPools(chainId?: SupportedChainId, user?: string) {
  return useSWR(
    [chainId, user],
    async ([chainId, user]): Promise<IMinimalPool[]> => {
      console.log({ chainId, user });
      if (!user || !chainId) return [];
      const chainName = BalancerChainName[chainId];
      return await GQL_CLIENT[chainId]
        .request<IQuery>(USER_POOLS_QUERY, {
          where: {
            userAddress: user,
            chainIn: [chainName],
            poolTypeIn: ["COW_AMM"],
          },
        })
        .then((result) => {
          return result.pools.map((pool) => ({
            ...pool,
            userBalance: {
              ...pool.userBalance,
              walletBalance: parseUnits(
                pool.userBalance.walletBalance,
                pool.decimals
              ),
              totalBalance: parseUnits(
                pool.userBalance.totalBalance,
                pool.decimals
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
                pool.decimals
              ),
            },
          }));
        });
    }
  );
}
