import type { FormType } from "#/types";

function remove0x(v: string): string {
  return v.slice(2);
}

function processAmount(amount: string | number) {
  return BigInt(Number(amount) * 10 ** 18)
    .toString(16)
    .padStart(64, "0");
}

export function encodeFormData(data: FormType): string {
  const { poolId, amounts, referenceTokenAddress } = data;

  const keys = Object.keys(amounts || {});
  const values = Object.values(amounts || {});

  const encodedPoolId = remove0x(poolId); // size = 40
  const encodedToken1 = remove0x(keys[0]); // size = 40
  const encodedToken2 = remove0x(keys[1]); // size = 40

  const encodedAmount1 = processAmount(values[0]); // size = 64
  const encodedAmount2 = processAmount(values[1]); // size = 64

  const encodedReferenceTokenAddress = remove0x(referenceTokenAddress); // size = 40

  // total size = 288
  const result =
    encodedPoolId +
    encodedToken1 +
    encodedToken2 +
    encodedAmount1 +
    encodedAmount2 +
    encodedReferenceTokenAddress;

  return result;
}
