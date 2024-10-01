import { stringToHex } from "viem";

export function getCowShedNonce() {
  return stringToHex(Date.now().toString(), { size: 32 });
}
