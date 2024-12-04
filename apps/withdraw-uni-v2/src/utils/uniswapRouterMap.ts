import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { Address } from "viem";

export const uniswapRouterMap: Record<SupportedChainId, Address | undefined> = {
  [SupportedChainId.ARBITRUM_ONE]: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  [SupportedChainId.MAINNET]: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  [SupportedChainId.SEPOLIA]: undefined,
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
} as const;
