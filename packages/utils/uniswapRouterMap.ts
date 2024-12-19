import { SupportedChainId } from "@cowprotocol/cow-sdk";
import type { Address } from "viem";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const uniswapRouterMap: Record<SupportedChainId, Address | undefined> = {
  [SupportedChainId.ARBITRUM_ONE]: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  [SupportedChainId.MAINNET]: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  [SupportedChainId.SEPOLIA]: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.BASE]: "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
} as const;

export const uniswapFactoryMap: Record<SupportedChainId, Address | undefined> =
  {
    [SupportedChainId.ARBITRUM_ONE]:
      "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9",
    [SupportedChainId.MAINNET]: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    [SupportedChainId.SEPOLIA]: "0xF62c03E08ada871A0bEb309762E260a7a6a880E6",
    [SupportedChainId.GNOSIS_CHAIN]: undefined,
    [SupportedChainId.BASE]: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
  } as const;
