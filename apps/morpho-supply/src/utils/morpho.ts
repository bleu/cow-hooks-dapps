export const calculateLLTVWithSafetyMargin = (lltv: bigint) =>
  (lltv * BigInt(9500)) / BigInt(10000);
