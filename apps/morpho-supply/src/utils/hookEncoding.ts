import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { decodeAbiParameters, encodeAbiParameters, formatUnits } from "viem";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { decimalsToBigInt } from "./decimalsToBigInt";

export const encodingParams = [
  { name: "marketId", type: "bytes32" },
  { name: "supplyAmount", type: "uint256" },
  { name: "borrowAmount", type: "uint256" },
  { name: "isMaxSupply", type: "bool" },
  { name: "isMaxBorrow", type: "bool" },
] as const;

export function encodeFormData(data: MorphoSupplyFormData): string {
  const { market, supplyAmount, borrowAmount, isMaxSupply, isMaxBorrow } = data;

  const supplyBigInt =
    decimalsToBigInt(supplyAmount, market.collateralAsset.decimals) ??
    BigInt(0);
  const borrowBigInt =
    decimalsToBigInt(borrowAmount, market.loanAsset.decimals) ?? BigInt(0);

  const encodedData = encodeAbiParameters(encodingParams, [
    market.uniqueKey as `0x${string}`,
    supplyBigInt,
    borrowBigInt,
    isMaxSupply,
    isMaxBorrow,
  ]);

  return encodedData.slice(-64 * encodingParams.length);
}

export function decodeFormData(
  string: `0x${string}`,
  markets: MorphoMarket[],
): MorphoSupplyFormData | undefined {
  const encodedFormData =
    `0x${string.slice(-64 * encodingParams.length)}` as `0x${string}`;

  const [marketKey, supplyBigInt, borrowBigInt, isMaxSupply, isMaxBorrow] =
    decodeAbiParameters(encodingParams, encodedFormData);

  const market = markets.find((mkt) => mkt.uniqueKey === marketKey);

  if (!market) return;

  const supplyAmount = formatUnits(
    supplyBigInt,
    market.collateralAsset.decimals,
  );
  const borrowAmount = formatUnits(borrowBigInt, market.loanAsset.decimals);

  return {
    market,
    supplyAmount,
    borrowAmount,
    isMaxSupply,
    isMaxBorrow,
  } as MorphoSupplyFormData;
}
