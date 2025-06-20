import type { MorphoMarket, MorphoMarketParams } from "@bleu/cow-hooks-ui";

import type { Address } from "viem";
import { getMarketParams } from "#/utils/getMarketParams";

export interface BorrowReallocation {
  vault: Address;
  from: MorphoMarketParams;
  to: MorphoMarketParams;
  fromKey: `0x${string}`;
  toKey: `0x${string}`;
  amount: bigint;
}

export function getPossibleReallocations(
  market: MorphoMarket,
  markets: MorphoMarket[],
): BorrowReallocation[] {
  const sharedLiquidity = market.publicAllocatorSharedLiquidity;

  const reallocations: BorrowReallocation[] = sharedLiquidity
    .map((liq) => {
      const fromMarket = markets.find(
        (m) => m.uniqueKey === liq.allocationMarket.uniqueKey,
      );
      if (!fromMarket) return;

      return {
        vault: liq.vault.address as Address,
        from: getMarketParams(fromMarket),
        to: getMarketParams(market),
        fromKey: fromMarket.uniqueKey,
        toKey: market.uniqueKey,
        amount: (liq.assets * BigInt(95)) / BigInt(100),
      };
    })
    .filter((liq) => liq !== undefined);

  return reallocations.sort((a, b) => {
    // For descending order
    if (a.amount > b.amount) return -1;
    if (a.amount < b.amount) return 1;
    return 0;
  });
}

export function getMaxBorrowReallocation(
  possibleReallocations: BorrowReallocation[],
) {
  let maxBorrowReallocation = BigInt(0);
  for (const reallocation of possibleReallocations)
    maxBorrowReallocation += reallocation.amount;
  return maxBorrowReallocation;
}

export function buildReallocations(
  market: MorphoMarket,
  amount: bigint,
  possibleReallocations: BorrowReallocation[],
): BorrowReallocation[] {
  const maxBorrowReallocation = getMaxBorrowReallocation(possibleReallocations);

  if (amount > market.liquidity + maxBorrowReallocation) return [];
  if (amount <= market.liquidity) return [];

  const reallocations = [] as BorrowReallocation[];
  const totalToReallocate = amount - market.liquidity;
  let missingReallocation = totalToReallocate;

  for (const reallocation of possibleReallocations) {
    const isReallocationSufficient = missingReallocation <= reallocation.amount;
    reallocations.push({
      ...reallocation,
      amount: isReallocationSufficient
        ? missingReallocation
        : reallocation.amount,
    });
    if (isReallocationSufficient) {
      break;
    }
    missingReallocation -= reallocation.amount;
  }
  return reallocations;
}
