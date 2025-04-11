import type { MorphoMarket, MorphoMarketParams } from "@bleu/cow-hooks-ui";
import { getMarketParams } from "./getMarketParams";

interface Withdrawal {
  marketKey: string;
  marketParams: MorphoMarketParams;
  amount: bigint;
  commonVault: string;
}

export function getMaxReallocatableLiquidity(
  market: MorphoMarket,
  markets: MorphoMarket[],
) {
  // 1. get reallocatableMarkets
  const reallocatableMarkets = markets.filter(
    (m) =>
      m.loanAsset.address === market.loanAsset.address &&
      m.supplyingVaults.some((vault) =>
        market.supplyingVaults.map((v) => v.address).includes(vault.address),
      ) &&
      m.uniqueKey !== market.uniqueKey,
  );

  let maxReallocatableLiquidity = BigInt(0);

  // 2. Prepare a list of possible max withdrawals:
  const possibleWithdrawals: Withdrawal[] = reallocatableMarkets.map((mkt) => {
    const commonVault = mkt.supplyingVaults
      .map((vault) => vault.address)
      .find((vaultAddress) =>
        market.supplyingVaults
          .map((vault) => vault.address)
          .includes(vaultAddress),
      );

    const liquidity = mkt.state.supplyAssets - mkt.state.borrowAssets;
    maxReallocatableLiquidity += liquidity;
    return {
      marketKey: mkt.uniqueKey,
      commonVault: commonVault ?? "",
      marketParams: getMarketParams(mkt),
      amount: liquidity,
    };
  });

  return { maxReallocatableLiquidity, possibleWithdrawals };
}

export function buildWithdrawals(
  market: MorphoMarket,
  amount: bigint,
  maxReallocatableLiquidity: bigint,
  possibleWithdrawals: Withdrawal[],
) {
  const marketLiquidity = market.state.supplyAssets - market.state.borrowAssets;

  if (amount > marketLiquidity + maxReallocatableLiquidity) return [];
  if (amount <= marketLiquidity) return [];

  const reallocations = [] as Withdrawal[];
  const totalToReallocate = amount - marketLiquidity;
  let missingReallocation = totalToReallocate;

  for (const possibleWithdraw of possibleWithdrawals) {
    const isReallocationSufficient =
      missingReallocation <= possibleWithdraw.amount;
    reallocations.push({
      marketKey: possibleWithdraw.marketKey,
      marketParams: possibleWithdraw.marketParams,
      amount: isReallocationSufficient
        ? missingReallocation
        : possibleWithdraw.amount,
      commonVault: possibleWithdraw.commonVault,
    });
    if (isReallocationSufficient) {
      break;
    }
    missingReallocation -= possibleWithdraw.amount;
  }
  return reallocations;
}
