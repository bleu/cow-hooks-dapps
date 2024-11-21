import { type IPool, useIFrameContext } from "@bleu/cow-hooks-ui";
import { BALANCER_GQL_CLIENT, BalancerChainName } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import { gql } from "graphql-request";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import useSWR from "swr";
import { type Address, parseUnits } from "viem";
import { useTokenBuyPools } from "./useTokenBuyPools";

interface IQuery {
  pool: {
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
      walletBalance: string;
      walletBalanceUsd: number;
      stakedBalances: {
        balance: string;
        stakingId: string;
      }[];
    };
  };
}

const POOL_QUERY = gql`
  query GetPool($id: String!, $chainName: GqlChain!) {
    pool: poolGetPool(id: $id, chain: $chainName) {
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

export function usePool(id?: string, chainId?: SupportedChainId) {
  return useSWR(
    [id, chainId],
    async ([id, chainId]): Promise<IPool | undefined> => {
      if (!id || !chainId) return;
      const chainName = BalancerChainName[chainId];
      return await BALANCER_GQL_CLIENT[chainId]
        .request<IQuery>(POOL_QUERY, {
          id,
          chainName,
        })
        .then((result) => {
          const pool = result.pool;
          return {
            ...pool,
            userBalance: {
              ...pool.userBalance,
              walletBalance: parseUnits(
                pool.userBalance.walletBalance,
                pool.decimals,
              ),
              stakedBalances: pool.userBalance.stakedBalances.map((staked) => ({
                balance: parseUnits(
                  Number(staked.balance).toFixed(pool.decimals),
                  pool.decimals,
                ),
                stakingId: staked.stakingId,
              })),
            },
            dynamicData: {
              ...pool.dynamicData,
              totalShares: parseUnits(
                Number(pool.dynamicData.totalShares).toFixed(pool.decimals),
                pool.decimals,
              ),
            },
          };
        });
    },
    {
      revalidateOnFocus: false,
    },
  );
}

export function useSelectedPool() {
  const { context } = useIFrameContext();

  const { data: pools } = useTokenBuyPools();
  const poolId = useWatch({ name: "poolId" });
  const { data, mutate } = usePool(poolId, context?.chainId);

  useEffect(() => {
    if (!pools || !poolId) return;
    const newSelectedPool = pools?.find((pool) => pool.id === poolId);

    if (!newSelectedPool) return;

    mutate(newSelectedPool);
  }, [poolId, pools, mutate]);

  return data;
}
