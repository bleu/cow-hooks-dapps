import { SupportedChainId } from "@cowprotocol/cow-sdk";

import { GraphQLClient } from "graphql-request";

const BASE_URL = `https://api-v3.balancer.fi/graphql`;
const TEST_URL = `https://test-api-v3.balancer.fi/graphql`;

export const GQL_CLIENT: Record<SupportedChainId, GraphQLClient> = {
  [SupportedChainId.MAINNET]: new GraphQLClient(BASE_URL),
  [SupportedChainId.SEPOLIA]: new GraphQLClient(TEST_URL),
  [SupportedChainId.ARBITRUM_ONE]: new GraphQLClient(BASE_URL),
  [SupportedChainId.GNOSIS_CHAIN]: new GraphQLClient(BASE_URL),
};

export const BalancerChainName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "MAINNET",
  [SupportedChainId.SEPOLIA]: "SEPOLIA",
  [SupportedChainId.ARBITRUM_ONE]: "ARBITRUM",
  [SupportedChainId.GNOSIS_CHAIN]: "GNOSIS",
};
