import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { IPool } from "..";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const BalancerUrlChainName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "ethereum",
  [SupportedChainId.SEPOLIA]: "sepolia",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum",
  [SupportedChainId.GNOSIS_CHAIN]: "gnosis",
  [SupportedChainId.BASE]: "base",
};

export function getBalancerCoWPoolLink(
  chainId: SupportedChainId,
  selectedPool: IPool,
) {
  const chainName = BalancerUrlChainName[chainId];
  const baseUrl =
    chainId === SupportedChainId.SEPOLIA
      ? "https://test.balancer.fi/pools"
      : "https://balancer.fi/pools";
  return `${baseUrl}/${chainName}/cow/${selectedPool.id.toLowerCase()}`;
}

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const UniswapV2ChainName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "ethereum",
  [SupportedChainId.SEPOLIA]: "ethereum_sepolia",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum",
  [SupportedChainId.GNOSIS_CHAIN]: "",
  [SupportedChainId.BASE]: "base",
};

export function getUniswapV2PoolLink(
  chainId: SupportedChainId,
  selectedPool: IPool,
) {
  if (chainId === SupportedChainId.GNOSIS_CHAIN) {
    throw new Error("Uniswap V2 is not supported on Gnosis Chain");
  }
  const chainName = UniswapV2ChainName[chainId];

  return `https://app.uniswap.org/explore/pools/${chainName}/${selectedPool.id.toLowerCase()}`;
}
