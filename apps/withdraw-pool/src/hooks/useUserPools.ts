import { SupportedChainId } from "@cowprotocol/cow-sdk";

import { gql } from "graphql-request";
import useSWR from "swr";

import { IMinimalPool } from "../types";
import { BalancerChainName, GQL_CLIENT } from "#/api/balancer";

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
      symbol
      dynamicData {
        totalLiquidity
        volume24h
      }
      allTokens {
        address
        symbol
        decimals
      }
      userBalance {
        totalBalance
      }
    }
  }
`;

export function useUserPools(chainId: SupportedChainId, user?: string) {
  return useSWR([chainId, user], async ([chainId, user]) => {
    if (!user || !chainId) return [];
    const chainName = BalancerChainName[chainId];
    return await GQL_CLIENT.request<{
      pools: IMinimalPool[];
    }>(USER_POOLS_QUERY, {
      where: {
        userAddress: user,
        chainIn: [chainName],
        poolTypeIn: ["COW_AMM"],
      },
    }).then((result) => {
      return result.pools;
    });
  });
}
