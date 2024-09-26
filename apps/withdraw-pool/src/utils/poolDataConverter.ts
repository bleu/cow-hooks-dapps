import { IMinimalPool } from "#/types";
import { PoolState } from "@balancer/sdk";

export function minimalPoolToPoolState(pool: IMinimalPool): PoolState {
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
