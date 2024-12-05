import { SupportedChainId } from "@cowprotocol/cow-sdk";

export const COW_PROTOCOL_LINK = "https://cow.fi/";

export interface BaseChainInfo {
  readonly docs: string;
  readonly bridge?: string;
  readonly explorer: string;
  readonly infoLink: string;
  readonly name: string;
  readonly addressPrefix: string;
  readonly label: string;
  readonly urlAlias: string;
  readonly helpCenterUrl?: string;
  readonly explorerTitle: string;
  readonly color: string;
}

export type ChainInfoMap = Record<SupportedChainId, BaseChainInfo>;

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    docs: "https://docs.cow.fi",
    explorer: "https://etherscan.io",
    infoLink: COW_PROTOCOL_LINK,
    label: "Ethereum",
    name: "mainnet",
    addressPrefix: "eth",
    explorerTitle: "Etherscan",
    urlAlias: "",
    color: "#62688F",
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    docs: "https://docs.gnosischain.com",
    bridge: "https://bridge.gnosischain.com/",
    explorer: "https://gnosisscan.io",
    infoLink: "https://www.gnosischain.com",
    label: "Gnosis Chain",
    name: "gnosis_chain",
    addressPrefix: "gno",
    explorerTitle: "Gnosisscan",
    urlAlias: "gc",
    color: "#07795B",
  },
  [SupportedChainId.SEPOLIA]: {
    docs: "https://docs.cow.fi",
    explorer: "https://sepolia.etherscan.io",
    infoLink: COW_PROTOCOL_LINK,
    label: "Sepolia",
    name: "sepolia",
    addressPrefix: "sep",
    explorerTitle: "Etherscan",
    urlAlias: "sepolia",
    color: "#C12FF2",
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    docs: "https://docs.cow.fi",
    explorer: "https://arbiscan.io",
    infoLink: COW_PROTOCOL_LINK,
    label: "Arbitrum One",
    name: "arbitrum_one",
    addressPrefix: "arb1",
    explorerTitle: "Arbiscan",
    urlAlias: "arb1",
    color: "#29B6AF",
  },
};

export const CHAIN_INFO_ARRAY: BaseChainInfo[] = Object.values(CHAIN_INFO);

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  return CHAIN_INFO[chainId];
}
