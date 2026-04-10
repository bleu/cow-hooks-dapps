import { RPC_URL_MAPPING } from "@bleu/utils/transactionFactory";
import { SupportedChainId } from "@cowprotocol/cow-sdk";
import { http, type PublicClient, createPublicClient, fallback } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  gnosis,
  mainnet,
  polygon,
  sepolia,
} from "viem/chains";

/**
 * #CHAIN-INTEGRATION
 * This needs to be changed if you want to support a new chain
 */
export const publicClientMapping: Record<
  SupportedChainId | number,
  PublicClient
> = {
  [SupportedChainId.MAINNET]: createPublicClient({
    chain: mainnet,
    transport: fallback([
      http(RPC_URL_MAPPING[SupportedChainId.MAINNET]),
      http(),
    ]),
  }),
  [SupportedChainId.GNOSIS_CHAIN]: createPublicClient({
    chain: gnosis,
    transport: fallback([
      http(RPC_URL_MAPPING[SupportedChainId.GNOSIS_CHAIN]),
      http(),
    ]),
  }),
  [SupportedChainId.ARBITRUM_ONE]: createPublicClient({
    chain: arbitrum,
    transport: fallback([
      http(RPC_URL_MAPPING[SupportedChainId.ARBITRUM_ONE]),
      http(),
    ]),
  }),
  [SupportedChainId.SEPOLIA]: createPublicClient({
    chain: sepolia,
    transport: fallback([
      http(RPC_URL_MAPPING[SupportedChainId.SEPOLIA]),
      http(),
    ]),
  }),
  [SupportedChainId.BASE]: createPublicClient({
    chain: base,
    transport: fallback([http(RPC_URL_MAPPING[SupportedChainId.BASE]), http()]),
  }) as PublicClient,
  [43114]: createPublicClient({
    chain: avalanche,
    transport: fallback([http(RPC_URL_MAPPING[43114]), http()]),
  }) as PublicClient,
  [137]: createPublicClient({
    chain: polygon,
    transport: fallback([http(RPC_URL_MAPPING[137]), http()]),
  }) as PublicClient,
};
