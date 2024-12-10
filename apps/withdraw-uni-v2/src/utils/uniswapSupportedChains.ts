import { SupportedChainId } from "@cowprotocol/cow-sdk";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const ALL_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.SEPOLIA,
  SupportedChainId.BASE,
];

export const isChainIdSupported = (chainId: SupportedChainId) =>
  ALL_SUPPORTED_CHAIN_IDS.includes(chainId);
