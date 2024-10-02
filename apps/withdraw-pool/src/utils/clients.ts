import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { createPublicClient, http } from "viem";
import { arbitrum, gnosis, mainnet, sepolia } from "viem/chains";

export type PublicClientType = ReturnType<typeof createPublicClient>;

export const publicClientMapping = {
  [SupportedChainId.MAINNET]: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  [SupportedChainId.GNOSIS_CHAIN]: createPublicClient({
    chain: gnosis,
    transport: http(),
  }),
  [SupportedChainId.ARBITRUM_ONE]: createPublicClient({
    chain: arbitrum,
    transport: http(),
  }),
  [SupportedChainId.SEPOLIA]: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
};
