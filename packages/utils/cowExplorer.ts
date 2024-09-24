// from https://github.com/cowprotocol/cowswap/blob/develop/libs/common-utils/src/explorer.ts

import { SupportedChainId } from "@cowprotocol/cow-sdk";

/**
 * Unique identifier for the order: 56 bytes encoded as hex with `0x` prefix.
 * Bytes 0..32 are the order digest, bytes 30..52 the owner address and bytes
 * 52..56 the expiry (`validTo`) as a `uint32` unix epoch timestamp.
 *
 */
export type UID = string;

function _getExplorerUrlByEnvironment(): Record<SupportedChainId, string> {
  const baseUrl =
    process.env.NEXT_PUBLIC_COW_EXPLORER_URL_PROD || "https://explorer.cow.fi";

  return {
    [SupportedChainId.MAINNET]: baseUrl,
    [SupportedChainId.GNOSIS_CHAIN]: `${baseUrl}/gc`,
    [SupportedChainId.ARBITRUM_ONE]: `${baseUrl}/arb1`,
    [SupportedChainId.SEPOLIA]: `${baseUrl}/sepolia`,
  };
}

const EXPLORER_BASE_URL: Record<SupportedChainId, string> =
  _getExplorerUrlByEnvironment();

export function getExplorerBaseUrl(chainId: SupportedChainId): string {
  const baseUrl = EXPLORER_BASE_URL[chainId];

  if (!baseUrl) {
    throw new Error(
      `Unsupported Network. The operator API is not deployed in the Network ${chainId}`,
    );
  }
  return baseUrl;
}

export function getExplorerOrderLink(
  chainId: SupportedChainId,
  orderId: UID,
): string {
  const baseUrl = getExplorerBaseUrl(chainId);

  return `${baseUrl}/orders/${orderId}`;
}

export function getExplorerAddressLink(
  chainId: SupportedChainId,
  address: string,
): string {
  const baseUrl = getExplorerBaseUrl(chainId);

  return `${baseUrl}/address/${address}`;
}

enum Explorers {
  Explorer = "Explorer",
  Blockscout = "Blockscout",
  Etherscan = "Etherscan",
  Arbiscan = "Arbiscan",
}

// Used for GA ExternalLink detection
export function detectExplorer(href: string) {
  if (href.includes("explorer")) {
    return Explorers.Explorer;
  }
  if (href.includes("blockscout")) {
    return Explorers.Blockscout;
  }
  if (href.includes("etherscan")) {
    return Explorers.Etherscan;
  }
  if (href.includes("arbiscan")) {
    return Explorers.Arbiscan;
  }
  return undefined;
}
