import { SupportedChainId } from "@cowprotocol/cow-sdk";

import { GraphQLClient } from "graphql-request";

const BASE_URL = `https://api-v3.balancer.fi/graphql`;
export const GQL_CLIENT = new GraphQLClient(BASE_URL);

export const BalancerChainName: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: "MAINNET",
  [SupportedChainId.SEPOLIA]: "SEPOLIA",
  [SupportedChainId.ARBITRUM_ONE]: "ARBITRUM",
  [SupportedChainId.GNOSIS_CHAIN]: "GNOSIS",
};
