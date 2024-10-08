import { PermitInfo } from "@cowprotocol/permit-utils";

export function isSupportedPermitInfo(
  p: PermitInfo | undefined
): p is PermitInfo {
  return !!p && p.type !== "unsupported";
}
