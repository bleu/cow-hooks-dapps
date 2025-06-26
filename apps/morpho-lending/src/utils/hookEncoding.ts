import type { MorphoMarket } from "@bleu/cow-hooks-ui";
import { decodeAbiParameters, encodeAbiParameters, formatUnits } from "viem";
import { OperationType } from "#/constants/forms";
import type { MorphoSupplyFormData } from "#/contexts/form";
import { decimalsToBigInt } from "./decimalsToBigInt";

export const encodingParams = [
  { name: "marketId", type: "bytes32" },
  { name: "supplyAmount", type: "uint256" },
  { name: "borrowAmount", type: "uint256" },
  { name: "isMaxSupply", type: "bool" },
  { name: "isMaxBorrow", type: "bool" },
  { name: "repayAmount", type: "uint256" },
  { name: "withdrawAmount", type: "uint256" },
  { name: "isMaxRepay", type: "bool" },
  { name: "isMaxWithdraw", type: "bool" },
  { name: "isSupplyBorrow", type: "bool" },
] as const;

export function encodeFormData(data: MorphoSupplyFormData): string {
  const {
    market,
    supplyAmount,
    borrowAmount,
    isMaxSupply,
    isMaxBorrow,
    repayAmount,
    withdrawAmount,
    isMaxRepay,
    isMaxWithdraw,
    operationType,
  } = data;

  const supplyBigInt =
    decimalsToBigInt(supplyAmount, market.collateralAsset.decimals) ??
    BigInt(0);
  const borrowBigInt =
    decimalsToBigInt(borrowAmount, market.loanAsset.decimals) ?? BigInt(0);
  const repayBigInt =
    decimalsToBigInt(repayAmount, market.loanAsset.decimals) ?? BigInt(0);
  const withdrawBigInt =
    decimalsToBigInt(withdrawAmount, market.collateralAsset.decimals) ??
    BigInt(0);

  const encodedData = encodeAbiParameters(encodingParams, [
    market.uniqueKey as `0x${string}`,
    supplyBigInt,
    borrowBigInt,
    isMaxSupply,
    isMaxBorrow,
    repayBigInt,
    withdrawBigInt,
    isMaxRepay,
    isMaxWithdraw,
    operationType === OperationType.SupplyBorrow,
  ]);

  return encodedData.slice(-64 * encodingParams.length);
}

export function decodeFormData(
  string: `0x${string}`,
  markets: MorphoMarket[],
): MorphoSupplyFormData | undefined {
  const encodedFormData =
    `0x${string.slice(-64 * encodingParams.length)}` as `0x${string}`;

  const [
    marketKey,
    supplyBigInt,
    borrowBigInt,
    isMaxSupply,
    isMaxBorrow,
    repayBigInt,
    withdrawBigInt,
    isMaxRepay,
    isMaxWithdraw,
    isSupplyBorrow,
  ] = decodeAbiParameters(encodingParams, encodedFormData);

  const market = markets.find((mkt) => mkt.uniqueKey === marketKey);

  if (!market) return;

  const supplyAmount = supplyBigInt
    ? formatUnits(supplyBigInt, market.collateralAsset.decimals)
    : "";
  const borrowAmount = borrowBigInt
    ? formatUnits(borrowBigInt, market.loanAsset.decimals)
    : "";
  const repayAmount = repayBigInt
    ? formatUnits(repayBigInt, market.loanAsset.decimals)
    : "";
  const withdrawAmount = withdrawBigInt
    ? formatUnits(withdrawBigInt, market.collateralAsset.decimals)
    : "";

  const operationType = isSupplyBorrow
    ? OperationType.SupplyBorrow
    : OperationType.RepayWithdraw;

  return {
    market,
    supplyAmount,
    borrowAmount,
    repayAmount,
    withdrawAmount,
    isMaxSupply,
    isMaxBorrow,
    isMaxRepay,
    isMaxWithdraw,
    operationType,
  } as MorphoSupplyFormData;
}
