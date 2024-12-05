import { SupportedChainId } from "@cowprotocol/cow-sdk";

export const ALL_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.SEPOLIA,
];

export const isChainIdSupported = (chainId: SupportedChainId) =>
  ALL_SUPPORTED_CHAIN_IDS.includes(chainId);
