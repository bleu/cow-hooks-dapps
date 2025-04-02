import { encodeAbiParameters } from "viem";
import type { DepositMorphoEncodeData } from "./types";

export const encodingParams = [
  { name: "vaultId", type: "address" },
  { name: "amountBigInt", type: "uint256" },
] as const;

export function encodeFormData(data: DepositMorphoEncodeData): string {
  const { vaultId, amount } = data;

  const encodedData = encodeAbiParameters(encodingParams, [
    vaultId as `0x${string}`,
    amount,
  ]);

  return encodedData.slice(-64 * encodingParams.length);
}
