import type { PoolState } from "@balancer/sdk";
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
