import { BigNumber, type BigNumberish } from "ethers";

export function multiplyValueByPct(
  value: BigNumberish,
  pct: number
): BigNumber {
  return BigNumber.from(value).mul(pct).div(100);
}

export function getPctFromValue(
  value: BigNumberish,
  total: BigNumberish
): number {
  return BigNumber.from(value).mul(100).div(total).toNumber();
}
