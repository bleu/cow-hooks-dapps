import type { MorphoMarket } from "../types";

/**
 * Ensures all bigint fields in MorphoMarket objects are properly converted to bigint type
 * @param markets Array of MorphoMarket objects
 * @returns Array of MorphoMarket objects with all bigint fields guaranteed to be of bigint type
 */
export function ensureBigIntType(markets: MorphoMarket[]): MorphoMarket[] {
  return markets.map((market) => {
    // Create a deep copy to avoid modifying the original object
    const newMarket = structuredClone(market);

    // Convert fields in state
    if (newMarket.state) {
      newMarket.state.supplyAssets = ensureBigInt(newMarket.state.supplyAssets);
      newMarket.state.borrowAssets = ensureBigInt(newMarket.state.borrowAssets);
      newMarket.state.liquidityAssets = ensureBigInt(
        newMarket.state.liquidityAssets,
      );
    }

    // Convert lltv
    newMarket.lltv = ensureBigInt(newMarket.lltv);

    // Convert reallocatableLiquidityAssets
    newMarket.reallocatableLiquidityAssets = ensureBigInt(
      newMarket.reallocatableLiquidityAssets,
    );

    // Convert position fields if position exists
    if (newMarket.position) {
      newMarket.position.borrowAssets = ensureBigInt(
        newMarket.position.borrowAssets,
      );
      newMarket.position.borrowShares = ensureBigInt(
        newMarket.position.borrowShares,
      );
      newMarket.position.collateral = ensureBigInt(
        newMarket.position.collateral,
      );
      newMarket.position.collateralValue = ensureBigInt(
        newMarket.position.collateralValue,
      );
      newMarket.position.supplyAssets = ensureBigInt(
        newMarket.position.supplyAssets,
      );
      newMarket.position.supplyShares = ensureBigInt(
        newMarket.position.supplyShares,
      );
    }

    return newMarket;
  });
}

/**
 * Helper function to ensure a value is of bigint type
 * @param value Value to convert to bigint if it's not already
 * @returns Value as bigint
 */
export function ensureBigInt(value: string | bigint | null | number): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  // Handle null or undefined
  if (value == null) {
    return BigInt(0);
  }

  // For string, number, or any other type, convert to bigint
  return BigInt(value);
}
