export * from "./cowNativeToken";
export * from "./addressUtils";
export * from "./chainInfo";
export * from "./cowExplorer";
export * from "./balancerApi";
export * from "./math";
export * from "./schema";
export * from "./decode";
export * from "./cowApi";
export * from "./constraintStringToBeNumeric";
export * from "./types";
export * from "./uniswapRouterMap";
export * from "./readPairsData";
export * from "./uniswapSupportedChains";
export * from "./decodeDepositCalldata";
export * from "./encodeDepositFormData";
export * from "./morphoApi";

export function truncateAddress(address?: string | null) {
  if (!address) return address;

  const match = address.match(/^([a-zA-Z0-9]{6})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/);
  if (!match) return address;

  return `${match[1]}…${match[2]}`;
}
