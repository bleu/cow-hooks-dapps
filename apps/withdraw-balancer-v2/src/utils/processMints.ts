import type { Address } from "viem";
import type { UserLpMintsReturn } from "./getUserLpMints";

interface Pair {
  id: Address;
  reserve0: number;
  reserve1: number;
  token0Price: number;
  token1Price: number;
  totalSupply: number;
  token0: {
    id: Address;
    name: string;
    symbol: string;
    decimals: number;
    totalLiquidity: number;
    derivedETH: number;
    priceUsd: number;
  };
  token1: {
    id: Address;
    name: string;
    symbol: string;
    decimals: number;
    totalLiquidity: number;
    derivedETH: number;
    priceUsd: number;
  };
}

const filterUniqueMintsPairs = (
  mints: UserLpMintsReturn["mints"],
): UserLpMintsReturn["mints"] => {
  const uniquePairsMap = new Map();
  for (const mint of mints) {
    if (!uniquePairsMap.has(mint.pair.id)) {
      uniquePairsMap.set(mint.pair.id, mint);
    }
  }
  return Array.from(uniquePairsMap.values());
};

export function processMints(
  rawMints: UserLpMintsReturn,
  token: string,
): Pair[] {
  // Filter by sell token
  const mintsForRequiredToken = rawMints.mints.filter(
    (mint) =>
      mint.pair.token0.id.toLowerCase() === token.toLowerCase() ||
      mint.pair.token1.id.toLowerCase() === token.toLowerCase(),
  );

  // Remove duplicated pairs
  const uniqueMints = filterUniqueMintsPairs(mintsForRequiredToken);

  // Convert string to right type
  const pairsWithoutPrice = uniqueMints.map((mint) => {
    return {
      id: mint.pair.id as Address,
      reserve0: Number(mint.pair.reserve0),
      reserve1: Number(mint.pair.reserve1),
      token0Price: Number(mint.pair.token0Price),
      token1Price: Number(mint.pair.token1Price),
      totalSupply: Number(mint.pair.totalSupply),
      token0: {
        ...mint.pair.token0,
        id: mint.pair.token0.id as Address,
        decimals: Number(mint.pair.token0.decimals),
        totalLiquidity: Number(mint.pair.token0.totalLiquidity),
        derivedETH: Number(mint.pair.token0.derivedETH),
      },
      token1: {
        ...mint.pair.token1,
        id: mint.pair.token1.id as Address,
        decimals: Number(mint.pair.token1.decimals),
        totalLiquidity: Number(mint.pair.token1.totalLiquidity),
        derivedETH: Number(mint.pair.token1.derivedETH),
      },
    };
  });

  // Compute tokens USD price
  const ethPrice = Number(rawMints.bundle.ethPrice);
  const pairs: Pair[] = pairsWithoutPrice.map((pair) => {
    return {
      ...pair,
      token0: { ...pair.token0, priceUsd: pair.token0.derivedETH * ethPrice },
      token1: { ...pair.token1, priceUsd: pair.token1.derivedETH * ethPrice },
    };
  });

  return pairs;
}
