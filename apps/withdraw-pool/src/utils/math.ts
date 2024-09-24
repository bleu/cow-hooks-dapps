import { BigNumber } from "ethers";

export function multiplyValueByPct(value: string, pct: number): string {
  return BigNumber.from(value).mul(pct).div(100).toString();
}
