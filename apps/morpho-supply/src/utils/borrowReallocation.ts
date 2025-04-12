import type { MorphoMarket, MorphoMarketParams } from "@bleu/cow-hooks-ui";

import { morphoPublicAllocatorAbi } from "@bleu/utils/transactionFactory";
import type { Address, PublicClient } from "viem";
import { getMarketParams } from "#/utils/getMarketParams";
import { publicAllocatorMap } from "#/utils/publicAllocatorMap";

export interface BorrowReallocation {
  vault: Address;
  from: MorphoMarketParams;
  to: MorphoMarketParams;
  fromKey: `0x${string}`;
  toKey: `0x${string}`;
  amount: bigint;
}

function mapPossibleReallocations(
  market: MorphoMarket,
  markets: MorphoMarket[],
): Omit<BorrowReallocation, "amount">[] {
  const possibleReallocations = [] as Omit<BorrowReallocation, "amount">[];

  const possibleVaults = getVaults(market);

  for (const vault of possibleVaults) {
    for (const mkt of markets) {
      if (mkt.uniqueKey === market.uniqueKey) continue;
      const mktVaults = getVaults(mkt);
      if (
        mktVaults.includes(vault) &&
        mkt.loanAsset.address === market.loanAsset.address
      )
        possibleReallocations.push({
          vault,
          from: getMarketParams(mkt),
          to: getMarketParams(market),
          fromKey: mkt.uniqueKey,
          toKey: market.uniqueKey,
        });
    }
  }

  return possibleReallocations;
}

function getVaults(market: MorphoMarket) {
  return market.supplyingVaults.map((vault) => vault.address);
}

export async function getPossibleReallocations(
  market: MorphoMarket,
  markets: MorphoMarket[],
  publicClient: PublicClient,
  chainId: number,
): Promise<BorrowReallocation[]> {
  const reallocations = mapPossibleReallocations(market, markets);
  const publicAllocatorAddress = publicAllocatorMap[chainId];

  if (reallocations.length === 0) return [];

  const multicallRequests = reallocations.map((reallocation) => ({
    address: publicAllocatorAddress,
    abi: morphoPublicAllocatorAbi,
    functionName: "flowCaps",
    args: [reallocation.vault, reallocation.fromKey],
  }));

  try {
    const flowCapsResults = (await publicClient.multicall({
      contracts: multicallRequests,
    })) as (
      | {
          error?: undefined;
          result: [bigint, bigint];
          status: "success";
        }
      | {
          error: Error;
          result?: undefined;
          status: "failure";
        }
    )[];

    const borrowReallocations: BorrowReallocation[] = [];

    for (let i = 0; i < flowCapsResults.length; i++) {
      const result = flowCapsResults[i];

      if (result.status !== "success") continue;

      const [_maxIn, maxOut] = result.result as [bigint, bigint];

      if (maxOut > BigInt(0)) {
        borrowReallocations.push({
          ...reallocations[i],
          amount: maxOut,
        });
      }
    }

    return borrowReallocations.sort((a, b) => {
      // For descending order
      if (a.amount > b.amount) return -1;
      if (a.amount < b.amount) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error in multicall for flow caps:", error);
    return [];
  }
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
