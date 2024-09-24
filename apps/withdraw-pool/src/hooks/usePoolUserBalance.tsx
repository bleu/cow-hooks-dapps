import { Token } from "@uniswap/sdk-core";

import type { IPoolBalance } from "../types";

export function usePoolUserBalance(poolId?: string): IPoolBalance[] {
  if (!poolId) return [];
  return [
    {
      token: new Token(
        11155111,
        "0x912ce59144191c1204e64559fe8253a0e49e6548",
        18,
        "ARB",
        "Arbitrum",
      ),
      fiatAmount: "2765252315984615",
      balance: "100000000000000000",
    },
    {
      token: new Token(
        11155111,
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        18,
        "WETH",
        "Wrapped Ether",
      ),
      fiatAmount: "2765252315984615",
      balance: "100000000000000000",
    },
  ];
}
