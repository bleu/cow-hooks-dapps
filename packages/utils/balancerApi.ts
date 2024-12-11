import { ChainId } from "@balancer/sdk";
import { SupportedChainId } from "@cowprotocol/cow-sdk";

import { GraphQLClient } from "graphql-request";

const BASE_URL = "https://api-v3.balancer.fi/graphql";
const TEST_URL = "https://test-api-v3.balancer.fi/graphql";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const BALANCER_API_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: BASE_URL,
  [SupportedChainId.SEPOLIA]: TEST_URL,
  [SupportedChainId.ARBITRUM_ONE]: BASE_URL,
  [SupportedChainId.GNOSIS_CHAIN]: BASE_URL,
  [SupportedChainId.BASE]: BASE_URL,
};

export const BALANCER_GQL_CLIENT: Record<SupportedChainId, GraphQLClient> = {
  [SupportedChainId.MAINNET]: new GraphQLClient(BASE_URL),
  [SupportedChainId.SEPOLIA]: new GraphQLClient(TEST_URL),
  [SupportedChainId.ARBITRUM_ONE]: new GraphQLClient(BASE_URL),
  [SupportedChainId.GNOSIS_CHAIN]: new GraphQLClient(BASE_URL),
  [SupportedChainId.BASE]: new GraphQLClient(BASE_URL),
};

export const SUPPORTED_CHAIN_ID_TO_CHAIN_ID: Record<SupportedChainId, ChainId> =
  {
    [SupportedChainId.MAINNET]: ChainId.MAINNET,
    [SupportedChainId.SEPOLIA]: ChainId.SEPOLIA,
    [SupportedChainId.ARBITRUM_ONE]: ChainId.ARBITRUM_ONE,
    [SupportedChainId.GNOSIS_CHAIN]: ChainId.GNOSIS_CHAIN,
    [SupportedChainId.BASE]: ChainId.BASE,
  };

export const BalancerChainName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "MAINNET",
  [SupportedChainId.SEPOLIA]: "SEPOLIA",
  [SupportedChainId.ARBITRUM_ONE]: "ARBITRUM",
  [SupportedChainId.GNOSIS_CHAIN]: "GNOSIS",
  [SupportedChainId.BASE]: "BASE",
};
