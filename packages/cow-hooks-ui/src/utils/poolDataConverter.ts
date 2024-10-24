import { BalancerApi, type PoolState } from "@balancer/sdk";
import { BALANCER_API_URL, SUPPORTED_CHAIN_ID_TO_CHAIN_ID } from "@bleu/utils";
import type { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { IPool } from "../types";

export function minimalPoolToPoolState(pool: IPool): PoolState {
  return {
    id: pool.id,
    protocolVersion: pool.protocolVersion,
    address: pool.address,
    tokens: pool.allTokens.map((token, index) => ({
      address: token.address,
      decimals: token.decimals,
      index,
      symbol: token.symbol,
    })),
    type: pool.type,
  };
}

export function fetchPoolState(
  poolId: string,
  chainId: SupportedChainId,
): Promise<PoolState> {
  const balancerApi = new BalancerApi(
    BALANCER_API_URL[chainId],
    SUPPORTED_CHAIN_ID_TO_CHAIN_ID[chainId],
  );
  return balancerApi.pools.fetchPoolState(poolId);
}
