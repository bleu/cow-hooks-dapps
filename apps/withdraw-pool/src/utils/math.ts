import { BigNumber, type BigNumberish } from "ethers";

export function multiplyValueByPct(
  value: BigNumberish,
  pct: number,
): BigNumber {
  return BigNumber.from(value).mul(pct).div(100);
}
