import type { DepositMorphoEncodeData } from "./types";

function remove0x(v: string): string {
  return v.startsWith("0x") ? v.slice(2) : v;
}

function processAmount(amount: bigint) {
  return amount.toString(16).padStart(64, "0");
}

export function encodeFormData(data: DepositMorphoEncodeData): string {
  const { vaultId, amount } = data;

  const encodedVaultId = remove0x(vaultId); // size = 40
  const encodedAmount = remove0x(processAmount(amount)); // size = 64

  // total size = 104
  const result = `${encodedVaultId + encodedAmount}`;

  return result;
}
